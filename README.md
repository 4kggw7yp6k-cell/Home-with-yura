# HOME with YURA Web Ver.2.0 α1

SwiftUI版「HOME with YURA — iOS Ver.2.0 α1」をベースに、GitHub Pagesで動作するPWAへ移植した版です。

## 実装
- ホーム／今日の暮らし
- 朝・昼・夜でユラさん立ち絵を自動切替
  - 朝 05:00–10:59
  - 昼 11:00–17:59
  - 夜 18:00–04:59
- 帰宅演出
- 日別の気分と天気
- 月間カレンダー
- 予定の追加・編集・削除
- 開始時間／終了時間／終日／カテゴリ／メモ
- 未来ストック
- 月収・固定費・自由費から「今月使える目安」を算出
- ダークモード
- JSONバックアップ書き出し／読み込み
- localStorage端末内保存
- PWA / オフラインキャッシュ

## GitHub更新方法
このZIPの中身をすべて、既存の Home-with-yura リポジトリのルートへ上書きアップロードし、Commit changes。
GitHub Pagesは main / (root) のままでOKです。

## データについて
予定・家計・気分などはブラウザのlocalStorageに保存され、GitHubリポジトリへ送信されません。

## 注意
SwiftUI版のJSON保存データはWeb版と保存場所が異なるため、自動移行はされません。
