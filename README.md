# Blog Image Optimizer

Hugo ブログ用の画像最適化ツールです。画像のリサイズ、圧縮、フォーマット変換、メタデータの削除を簡単に行えます。

## 機能

- **リサイズ**: 指定した幅・高さ、またはスケール倍率でリサイズ
- **画質最適化**: 画質を維持しながらファイルサイズを圧縮
- **フォーマット変換**: JPEG, PNG, WebP, AVIF 形式に変換
- **メタデータ削除**: 位置情報などのEXIFデータを自動削除
- **一括処理**: ディレクトリ内の画像を一括処理
- **再帰処理**: サブディレクトリも含めて再帰的に処理

## インストール

### 他のプロジェクトから使用する場合

#### ローカルパスから直接インストール

```bash
# プロジェクトのディレクトリで
npm install /path/to/blog-image-optimizer

# または相対パスで
npm install ../blog-image-optimizer
```

#### グローバルインストール（どこからでも使える）

```bash
# このリポジトリのディレクトリで
npm install -g .

# または別の場所から
npm install -g /path/to/blog-image-optimizer
```

### 開発用（このリポジトリ内で）

```bash
npm install
```

## 使い方

### CLIコマンドとして使用

インストール後は `optimize-image` コマンドが使えます。

```bash
# 単一ファイルの最適化（デフォルト画質80%、メタデータ削除）
optimize-image input.jpg

# ディレクトリ内の全画像を最適化
optimize-image ./images

# サブディレクトリも含めて再帰的に処理
optimize-image ./images -r
```

### 開発モード（このリポジトリ内で）

```bash
# 単一ファイルの最適化
node src/cli.js input.jpg

# またはnpmスクリプトで
npm start -- input.jpg
```

### リサイズ

```bash
# 幅を指定（アスペクト比を保持）
optimize-image input.jpg -w 800

# 高さを指定（アスペクト比を保持）
optimize-image input.jpg -h 600

# 幅と高さを指定（アスペクト比を保持して収まるサイズに）
optimize-image input.jpg -w 800 -h 600

# スケール倍率で指定（50%に縮小）
optimize-image input.jpg -s 0.5
```

### 画質調整

```bash
# 画質を指定（1-100、デフォルト: 80）
optimize-image input.jpg -q 90

# 高圧縮（ファイルサイズ優先）
optimize-image input.jpg -q 60
```

### フォーマット変換

```bash
# PNG を JPEG に変換
optimize-image input.png -f jpeg

# JPEG を WebP に変換（次世代フォーマット）
optimize-image input.jpg -f webp

# AVIF 形式に変換（最高の圧縮率）
optimize-image input.jpg -f avif
```

### 出力先の指定

```bash
# 出力ディレクトリを指定
optimize-image input.jpg -o ./output

# 出力ファイル名を指定
optimize-image input.jpg -n optimized.jpg

# 両方を指定
optimize-image input.jpg -o ./output -n thumbnail.jpg
```

### メタデータの保持

```bash
# メタデータを削除せずに保持
optimize-image input.jpg --keep-metadata
```

### 複合例

```bash
# Hugo ブログ用に最適化（幅800px、画質85、WebP形式、メタデータ削除）
optimize-image ./static/images -r -w 800 -q 85 -f webp -o ./static/images/optimized

# サムネイル作成（50%縮小、画質80、JPEG形式）
optimize-image hero.png -s 0.5 -q 80 -f jpeg -n hero-thumbnail.jpg

# モバイル用画像（幅480px、画質75、WebP形式）
optimize-image ./images -r -w 480 -q 75 -f webp -o ./images/mobile
```

## オプション一覧

| オプション | 短縮形 | 説明 | デフォルト |
|----------|--------|------|-----------|
| `--width <number>` | `-w` | 出力画像の幅（ピクセル） | 元のサイズ |
| `--height <number>` | `-h` | 出力画像の高さ（ピクセル） | 元のサイズ |
| `--scale <number>` | `-s` | スケール倍率（例: 0.5で50%） | 1.0 |
| `--quality <number>` | `-q` | 画質（1-100） | 80 |
| `--format <format>` | `-f` | 出力フォーマット（jpeg/png/webp/avif） | 元のフォーマット |
| `--keep-metadata` | - | メタデータを保持 | false（削除） |
| `--output-dir <dir>` | `-o` | 出力ディレクトリ | 入力と同じ |
| `--output-name <name>` | `-n` | 出力ファイル名 | 元の名前.optimized.拡張子 |
| `--recursive` | `-r` | 再帰的に処理 | false |

## サポートされるフォーマット

### 入力フォーマット
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- TIFF (.tiff)
- AVIF (.avif)

### 出力フォーマット
- JPEG (.jpeg) - 写真に適した形式
- PNG (.png) - 透過が必要な画像に最適
- WebP (.webp) - 次世代フォーマット、優れた圧縮率
- AVIF (.avif) - 最新フォーマット、最高の圧縮率

## Node.js プログラムから使用

他のプロジェクトのコードから直接利用することもできます。

```javascript
import { optimizeImage, optimizeImages } from 'blog-image-optimizer';

// 単一ファイルの最適化
const outputPath = await optimizeImage('input.jpg', {
  width: 800,
  quality: 85,
  format: 'webp',
  removeMetadata: true
});

// 複数ファイルの最適化
const results = await optimizeImages(['img1.jpg', 'img2.png'], {
  scale: 0.5,
  quality: 80,
  format: 'jpeg'
});
```

## Hugo ブログでの推奨設定

### ヒーロー画像
```bash
optimize-image hero.jpg -w 1200 -q 85 -f webp
```

### 記事内の画像
```bash
optimize-image article-images/ -r -w 800 -q 80 -f webp -o ./optimized
```

### サムネイル
```bash
optimize-image thumbnails/ -r -w 400 -q 75 -f webp -o ./optimized
```

## Tips

1. **WebP 形式の使用**: JPEG/PNG よりも20-30%小さいファイルサイズで同等の画質を実現
2. **メタデータの削除**: プライバシー保護とファイルサイズ削減のため、デフォルトで有効
3. **画質設定**: 80-85が品質とファイルサイズのバランスが良い
4. **一括処理**: `-r` オプションでサブディレクトリも含めて処理可能

## ライセンス

MIT

## 依存パッケージ

- [sharp](https://sharp.pixelplumbing.com/) - 高速な画像処理ライブラリ
- [commander](https://github.com/tj/commander.js) - CLI フレームワーク
