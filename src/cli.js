#!/usr/bin/env node

import { Command } from 'commander';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { optimizeImage, optimizeImages } from './optimizer.js';

const program = new Command();

// サポートされる画像拡張子
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.avif'];

/**
 * ディレクトリから画像ファイルを再帰的に取得
 */
async function getImageFiles(dirPath, recursive = false) {
  const files = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory() && recursive) {
      const subFiles = await getImageFiles(fullPath, recursive);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

program
  .name('optimize-image')
  .description('Hugo blog用の画像最適化ツール')
  .version('1.0.0');

program
  .argument('<input>', '入力ファイルまたはディレクトリのパス')
  .option('-w, --width <number>', '出力画像の幅（ピクセル）', parseInt)
  .option('-h, --height <number>', '出力画像の高さ（ピクセル）', parseInt)
  .option('-s, --scale <number>', 'スケール倍率（例: 0.5で50%に縮小）', parseFloat)
  .option('-q, --quality <number>', '画質（1-100、デフォルト: 80）', parseInt, 80)
  .option('-f, --format <format>', '出力フォーマット（jpeg, png, webp, avif）')
  .option('--keep-metadata', 'メタデータを保持する（デフォルトでは削除）', false)
  .option('-o, --output-dir <dir>', '出力ディレクトリ')
  .option('-n, --output-name <name>', '出力ファイル名')
  .option('-r, --recursive', 'ディレクトリを再帰的に処理', false)
  .action(async (input, options) => {
    try {
      const inputStat = await stat(input);
      const isDirectory = inputStat.isDirectory();

      let inputFiles = [];

      if (isDirectory) {
        console.log(`📁 ディレクトリから画像を検索中: ${input}`);
        inputFiles = await getImageFiles(input, options.recursive);
        console.log(`✓ ${inputFiles.length}個の画像ファイルが見つかりました\n`);

        if (inputFiles.length === 0) {
          console.log('⚠️  処理する画像がありません');
          process.exit(0);
        }
      } else {
        inputFiles = [input];
      }

      const optimizeOptions = {
        width: options.width,
        height: options.height,
        scale: options.scale,
        quality: options.quality,
        format: options.format,
        removeMetadata: !options.keepMetadata,
        outputDir: options.outputDir,
        outputName: options.outputName
      };

      // パラメータの検証
      if (options.scale && (options.scale <= 0 || options.scale > 10)) {
        console.error('❌ エラー: スケールは0より大きく10以下である必要があります');
        process.exit(1);
      }

      if (options.quality < 1 || options.quality > 100) {
        console.error('❌ エラー: 画質は1-100の範囲で指定してください');
        process.exit(1);
      }

      console.log('⚙️  最適化設定:');
      if (options.width || options.height) {
        console.log(`  サイズ: ${options.width || 'auto'} x ${options.height || 'auto'}`);
      }
      if (options.scale) {
        console.log(`  スケール: ${options.scale * 100}%`);
      }
      console.log(`  画質: ${options.quality}`);
      if (options.format) {
        console.log(`  フォーマット: ${options.format}`);
      }
      console.log(`  メタデータ削除: ${optimizeOptions.removeMetadata ? 'はい' : 'いいえ'}`);
      console.log('');

      // 最適化実行
      if (inputFiles.length === 1) {
        console.log(`🔄 処理中: ${inputFiles[0]}`);
        const outputPath = await optimizeImage(inputFiles[0], optimizeOptions);
        console.log(`✅ 完了: ${outputPath}\n`);
      } else {
        console.log('🔄 一括処理を開始します...\n');
        const results = await optimizeImages(inputFiles, optimizeOptions);

        let successCount = 0;
        let failCount = 0;

        results.forEach(result => {
          if (result.success) {
            console.log(`✅ ${result.input} → ${result.output}`);
            successCount++;
          } else {
            console.error(`❌ ${result.input}: ${result.error}`);
            failCount++;
          }
        });

        console.log(`\n📊 結果: ${successCount}個成功, ${failCount}個失敗`);
      }

    } catch (error) {
      console.error(`❌ エラー: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
