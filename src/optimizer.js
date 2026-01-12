import sharp from 'sharp';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, extname, basename, join } from 'path';

/**
 * 画像最適化オプション
 * @typedef {Object} OptimizeOptions
 * @property {number} [width] - リサイズ後の幅（ピクセル）
 * @property {number} [height] - リサイズ後の高さ（ピクセル）
 * @property {number} [scale] - スケール倍率（0-1の範囲、例: 0.5で50%に縮小）
 * @property {number} [quality] - 画質（1-100、デフォルト: 80）
 * @property {string} [format] - 出力フォーマット（jpeg, png, webp, avif）
 * @property {boolean} [removeMetadata] - メタデータを削除するか（デフォルト: true）
 * @property {string} [outputDir] - 出力ディレクトリ（デフォルト: 入力ファイルと同じディレクトリ）
 * @property {string} [outputName] - 出力ファイル名（デフォルト: 元のファイル名に最適化済みサフィックス）
 */

/**
 * 画像を最適化する
 * @param {string} inputPath - 入力画像のパス
 * @param {OptimizeOptions} options - 最適化オプション
 * @returns {Promise<string>} 出力ファイルのパス
 */
export async function optimizeImage(inputPath, options = {}) {
  const {
    width,
    height,
    scale,
    quality = 80,
    format,
    removeMetadata = true,
    outputDir,
    outputName
  } = options;

  // 入力ファイルの確認
  if (!existsSync(inputPath)) {
    throw new Error(`入力ファイルが見つかりません: ${inputPath}`);
  }

  // Sharpインスタンスの作成
  let image = sharp(inputPath);

  // メタデータの取得（リサイズ計算用）
  const metadata = await image.metadata();

  // リサイズ処理
  if (scale && scale > 0 && scale !== 1) {
    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);
    image = image.resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  } else if (width || height) {
    image = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // メタデータの削除
  if (removeMetadata) {
    image = image.rotate(); // EXIFの向き情報を適用してから削除
  }

  // フォーマット変換と圧縮
  const outputFormat = format || metadata.format || 'jpeg';

  switch (outputFormat.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      image = image.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      image = image.png({ quality, compressionLevel: 9 });
      break;
    case 'webp':
      image = image.webp({ quality });
      break;
    case 'avif':
      image = image.avif({ quality });
      break;
    default:
      throw new Error(`サポートされていないフォーマットです: ${outputFormat}`);
  }

  // 出力パスの決定
  const inputDir = dirname(inputPath);
  const inputBasename = basename(inputPath, extname(inputPath));
  const outputExtension = outputFormat === 'jpg' ? 'jpeg' : outputFormat;

  const finalOutputDir = outputDir || inputDir;
  const finalOutputName = outputName || `${inputBasename}.optimized.${outputExtension}`;
  const outputPath = join(finalOutputDir, finalOutputName);

  // 出力ディレクトリの作成
  if (!existsSync(finalOutputDir)) {
    await mkdir(finalOutputDir, { recursive: true });
  }

  // 画像の保存
  await image.toFile(outputPath);

  return outputPath;
}

/**
 * 複数の画像を一括最適化する
 * @param {string[]} inputPaths - 入力画像のパス配列
 * @param {OptimizeOptions} options - 最適化オプション
 * @returns {Promise<Array<{input: string, output: string, success: boolean, error?: string}>>}
 */
export async function optimizeImages(inputPaths, options = {}) {
  const results = [];

  for (const inputPath of inputPaths) {
    try {
      const outputPath = await optimizeImage(inputPath, options);
      results.push({
        input: inputPath,
        output: outputPath,
        success: true
      });
    } catch (error) {
      results.push({
        input: inputPath,
        output: null,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
