import { existsSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { sitePath } from './site';

export interface GalleryPhoto {
	src: string;
	alt: string;
}

export interface GalleryAlbum {
	slug: string;
	title: string;
	category: string;
	photos: GalleryPhoto[];
	subalbums?: GallerySubalbum[];
}

export interface GallerySubalbum {
	slug: string;
	title: string;
	photos: GalleryPhoto[];
}

export interface GalleryCategory {
	slug: string;
	title: string;
	albums: GalleryAlbum[];
}

const publicRoot = resolve(process.cwd(), 'public');
const galleryRoot = join(publicRoot, 'assets', 'gallery');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const knownCategories: Record<string, string> = {
	eventos: 'Eventos',
	retratos: 'Retratos',
	negocios: 'Negocios',
};
const albumTitles: Record<string, string> = {
	cumplesuenos: 'Cumplesueños',
};

function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function labelFromFolder(value: string): string {
	return value
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es'));
}

function photosIn(directory: string): GalleryPhoto[] {
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && supportedExtensions.has(extname(entry.name).toLowerCase()))
		.sort((first, second) => first.name.localeCompare(second.name, 'es', { numeric: true }))
		.map((entry) => {
			const filePath = join(directory, entry.name);
			const publicPath = relative(publicRoot, filePath).split(sep).map(encodeURIComponent).join('/');
			const fileLabel = labelFromFolder(basename(entry.name, extname(entry.name)));

			return { src: sitePath(publicPath), alt: fileLabel || 'Fotografía de Effer Glass' };
		});
}

export function getGalleryCategories(): GalleryCategory[] {
	const categoryFolders = existsSync(galleryRoot)
		? readdirSync(galleryRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
		: [];
	const folderBySlug = new Map(categoryFolders.map((entry) => [slugify(entry.name), entry.name]));
	const categorySlugs = new Set([...Object.keys(knownCategories), ...folderBySlug.keys()]);

	return [...categorySlugs]
		.sort((first, second) => first.localeCompare(second, 'es'))
		.map((categorySlug) => {
			const folderName = folderBySlug.get(categorySlug) ?? categorySlug;
			const categoryDirectory = join(galleryRoot, folderName);
			const albumFolders = existsSync(categoryDirectory)
				? readdirSync(categoryDirectory, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.sort((first, second) => first.name.localeCompare(second.name, 'es'))
				: [];
			const albums: GalleryAlbum[] = albumFolders.flatMap((folder) => {
				const albumDirectory = join(categoryDirectory, folder.name);
				const albumPhotoFiles = photosIn(albumDirectory);
				const subalbumFolders = readdirSync(albumDirectory, { withFileTypes: true })
					.filter((entry) => entry.isDirectory())
					.sort((first, second) => first.name.localeCompare(second.name, 'es'));
				const albumSlug = slugify(folder.name);
				const albumTitle = albumTitles[albumSlug] ?? labelFromFolder(folder.name);
				const subalbums: GallerySubalbum[] = subalbumFolders.flatMap((subfolder) => {
					const subalbumTitle = labelFromFolder(subfolder.name);
					const photos = photosIn(join(albumDirectory, subfolder.name));
					if (photos.length === 0) return [];

					return [{
						slug: slugify(subfolder.name),
						title: subalbumTitle,
						photos: photos.map((photo) => ({ ...photo, alt: `${photo.alt} · ${subalbumTitle}` })),
					}];
				});
				if (albumPhotoFiles.length === 0 && subalbums.length === 0) return [];
				const photos = [...albumPhotoFiles, ...subalbums.flatMap((subalbum) => subalbum.photos)];

				return [{
					slug: albumSlug,
					title: albumTitle,
					category: categorySlug,
					photos: photos.map((photo) => ({ ...photo, alt: `${photo.alt} · ${albumTitle}` })),
					subalbums,
				}];
			});
			const loosePhotos = photosIn(categoryDirectory);

			if (loosePhotos.length > 0) {
				albums.unshift({
					slug: 'seleccion-reciente',
					title: 'Selección reciente',
					category: categorySlug,
					photos: loosePhotos,
				});
			}

			return {
				slug: categorySlug,
				title: knownCategories[categorySlug] ?? labelFromFolder(folderName),
				albums,
			};
		});
}

export function getAllGalleryPhotos(): GalleryPhoto[] {
	return getGalleryCategories().flatMap((category) => category.albums.flatMap((album) => album.photos));
}