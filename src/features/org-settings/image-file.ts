"use client";

/**
 * A picked or dropped image, scaled down in the browser before it's sent: photos straight off a phone are several MB,
 * and the mock keeps uploads in memory. Logos and avatars stay PNG (transparency); photos become JPEG.
 */
export async function imageToDataUrl(file: File, { max, keepAlpha }: { max: number; keepAlpha: boolean }) {
	if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error("Use a PNG, JPG, GIF or WebP image");
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	return keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.82);
}
