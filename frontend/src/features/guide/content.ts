/**
 * ガイドページで使用するリンク情報です。
 */
export interface GuideLink {
  href: string;
  label: string;
  description: string;
}

/**
 * ガイド本文のセクション種別です。
 */
export type GuideSectionVariant = "paragraph" | "steps" | "callout";

/**
 * 使い方の流れで使用する詳細ステップです。
 */
export interface GuideStep {
  title: string;
  location: string;
  description: string;
  href?: string;
  hrefLabel?: string;
}

/**
 * ガイドページの本文セクションです。
 */
export interface GuideSection {
  id: string;
  title: string;
  variant?: GuideSectionVariant;
  body: string[];
  steps?: GuideStep[];
}

/**
 * ガイドページ全体のコンテンツ定義です。
 */
export interface GuidePageContent {
  slug: "getting-started" | "roadmap" | "activity" | "portfolio";
  shortLabel: string;
  title: string;
  description: string;
  goal: string;
  summary: string;
  sections: GuideSection[];
  prevLink?: GuideLink;
  nextLink: GuideLink;
}

/**
 * ガイドトップに表示するセクションリンクです。
 */
export const guideLinks: GuideLink[] = [
  {
    href: "/guide/getting-started",
    label: "Getting Started",
    description: "最初のロードマップを作り、LogFo の全体像をつかみます。",
  },
  {
    href: "/guide/roadmap",
    label: "ロードマップ作成ガイド",
    description: "目標との差分を学習計画に落とし込む考え方と流れを整理します。",
  },
  {
    href: "/guide/activity",
    label: "活動記録ガイド",
    description:
      "日々の学習を蓄積し、あとから振り返れる形に残す方法を案内します。",
  },
  {
    href: "/guide/portfolio",
    label: "ポートフォリオ作成・共有ガイド",
    description:
      "学習の蓄積を外部に伝わる形へまとめ、共有する流れを案内します。",
  },
];

const section = (
  id: string,
  title: string,
  body: string[],
  variant: GuideSectionVariant = "paragraph",
  steps?: GuideStep[],
): GuideSection => ({
  id,
  title,
  body,
  variant,
  steps,
});

/**
 * 機能別ガイドの本文です。
 */
export const guidePageContents: Record<
  GuidePageContent["slug"],
  GuidePageContent
> = {
  "getting-started": {
    slug: "getting-started",
    shortLabel: "Getting Started",
    title: "Getting Started",
    description:
      "LogFo を初めて使う人向けに、最初のロードマップ作成からポートフォリオ公開までの流れをつかむページです。",
    goal: "最初のロードマップを作り、活動記録とポートフォリオがどのようにつながるかを理解できるようになります。",
    summary:
      "初回は完璧を目指すより、LogFo の流れを一周して、学習の道筋がつながる感覚をつかむことを優先します。",
    sections: [
      section("why", "なぜこの機能を使うのか", [
        "LogFo は、学習の道筋を作り、日々の活動を蓄積し、外部に伝わる形へまとめるためのツールです。",
        "就活や転職では、学んだ量そのものよりも、目標に向かってどう積み上げたかが伝わることが重要です。LogFo はその流れを一つにつなぎます。",
      ]),
      section("first-step", "最初にやること", [
        "最初の一歩はロードマップ生成です。現在地と目標を入力し、何を学ぶべきかを見える化します。",
        "最初のロードマップができると、その後の活動記録やサマリー、ポートフォリオがすべて同じ流れの中で扱いやすくなります。",
      ]),
      section(
        "flow",
        "使い方の流れ",
        ["初回体験で辿るべき画面と操作の順序を確認します。"],
        "steps",
        [
          {
            title: "ロードマップを作る",
            location:
              "ロードマップ一覧ページ → `新しいロードマップ` → `AIで生成`",
            description:
              "現在地と目標を入力して、最初の学習計画を作ります。ここで作ったマイルストーンとタスクが、あとで活動記録の保存先になります。",
            href: "/roadmap",
            hrefLabel: "ロードマップ一覧ページへ",
          },
          {
            title: "学習記録を残す",
            location:
              "作成したロードマップ詳細ページ → タスクを選択 → 活動記録入力",
            description:
              "取り組んだ内容、詰まった点、次にやることを短く残します。まだ量が少なくても、この記録がサマリーとポートフォリオの元データになります。",
            href: "/roadmap",
            hrefLabel: "ロードマップ一覧から対象の詳細へ進む",
          },
          {
            title: "活動を振り返る",
            location:
              "サマリーページ → 対象ロードマップ / マイルストーンを選択",
            description:
              "残した記録をまとめて読み返し、AI 生成や編集を通じて、自分がどこで成長したかを文章として整理します。",
            href: "/summary",
            hrefLabel: "サマリーページへ",
          },
          {
            title: "ポートフォリオにまとめる",
            location:
              "ポートフォリオページ → 編集モード → プロフィール / PR・強み を編集",
            description:
              "サマリーや自由入力をもとに、相手に見せる文章へ整えます。まずは叩き台を作ることを優先し、後で手直しする前提で進めます。",
            href: "/portfolio",
            hrefLabel: "ポートフォリオページへ",
          },
          {
            title: "公開して共有する",
            location: "ポートフォリオページ → 保存 / 公開設定",
            description:
              "Slug と公開状態を設定すると、共有用の公開ページを作れます。採用担当者やメンターに見せる段階では、この URL を使います。",
            href: "/portfolio",
            hrefLabel: "公開設定を開くためにポートフォリオへ移動",
          },
        ],
      ),
      section(
        "pitfalls",
        "つまずきやすい点",
        [
          "最初から完成度の高いロードマップを作ろうとしなくて大丈夫です。まずは今の目標に対して一度作り、学習しながら見直す前提で進める方が使いやすくなります。",
          "活動記録やポートフォリオは後から強化できます。初回は、すべてを作り切るよりも流れを一周体験することを優先してください。",
        ],
        "callout",
      ),
      section("next", "次に進む先", [
        "まずはロードマップ作成ガイドを読み、最初の計画を作るところから始めるのがおすすめです。",
      ]),
    ],
    nextLink: {
      href: "/guide/roadmap",
      label: "ロードマップ作成ガイドへ",
      description: "最初のロードマップを作る流れを確認する",
    },
  },
  roadmap: {
    slug: "roadmap",
    shortLabel: "ロードマップ",
    title: "ロードマップ作成ガイド",
    description:
      "目標との差分を整理し、学習の道筋を具体的なマイルストーンとタスクに落とし込むためのガイドです。",
    goal: "今の自分に必要な学習テーマを整理し、最初のロードマップを作成できるようになります。",
    summary:
      "ロードマップ生成は、学習を始める前に迷いを減らすための設計図です。初回は方向性が合っていることを重視します。",
    sections: [
      section("why", "なぜこの機能を使うのか", [
        "学習が続かない原因の一つは、何をどの順番で進めるかが曖昧なことです。ロードマップ生成は、その曖昧さを減らすための入口です。",
        "就活では、志望企業や目指す職種との距離感が見えないと不安が残ります。ロードマップを作ることで、差分を学習計画として扱えるようになります。",
      ]),
      section("first-step", "最初にやること", [
        "現在の状態と目標の状態を入力し、AI 生成または手入力でロードマップを作成します。",
        "志望企業や目指したいポジションが決まっている場合は、その情報をできるだけ具体的に入れると、初回の計画が使いやすくなります。",
      ]),
      section(
        "flow",
        "使い方の流れ",
        [
          "ロードマップ生成画面で、入力から保存までを迷わず進めるための順序です。",
        ],
        "steps",
        [
          {
            title: "作成方式を選ぶ",
            location: "ロードマップ一覧ページ → `新しいロードマップ`",
            description:
              "まず `AIで生成` を選ぶと、初回でも学習計画のたたき台を早く作れます。自分で細かく決めたい場合だけ手入力を選びます。",
            href: "/roadmap",
            hrefLabel: "ロードマップ一覧ページへ",
          },
          {
            title: "目標を書く",
            location: "ロードマップ生成ページの目標入力エリア",
            description:
              "志望企業、目指す職種、いつまでに到達したいかを入力します。就活なら企業名や職種を書くと、差分の軸がぶれにくくなります。",
            href: "/roadmap/generate",
            hrefLabel: "ロードマップ生成ページへ",
          },
          {
            title: "現在地を書く",
            location: "同ページの現在地入力エリア",
            description:
              "経験のある技術、学習時間、今の悩みを埋めます。情報が具体的なほど、マイルストーンとタスクが現実的になります。",
            href: "/roadmap/generate",
            hrefLabel: "入力フォームに戻る",
          },
          {
            title: "生成結果を確認する",
            location: "生成後のロードマップ結果表示エリア",
            description:
              "マイルストーンの順序とタスクの粒度を見て、今の自分に対して重すぎないかを確認します。違和感があれば、そのまま修正に進みます。",
            href: "/roadmap/generate",
            hrefLabel: "生成結果を確認する",
          },
          {
            title: "最初の一歩を決めて保存する",
            location: "結果画面の編集後 → 保存",
            description:
              "今週着手するタスクを一つ決めてから保存すると、その後の活動記録にすぐつなげられます。初回は完璧さより着手しやすさを優先します。",
            href: "/roadmap",
            hrefLabel: "保存後はロードマップ一覧へ戻る",
          },
        ],
      ),
      section(
        "pitfalls",
        "つまずきやすい点",
        [
          "最初から細かく決めすぎると動きにくくなります。初回は大まかな方向性が合っているかを重視すると進めやすくなります。",
          "目標がぼんやりしていても、仮の目標で一度作って問題ありません。使いながら具体化する方が自然です。",
        ],
        "callout",
      ),
      section("next", "次に進む先", [
        "ロードマップができたら、次は活動記録ガイドを読み、日々の学習をどう残すかを確認してください。",
      ]),
    ],
    prevLink: guideLinks[0],
    nextLink: {
      href: "/guide/activity",
      label: "活動記録ガイドへ",
      description: "学習の蓄積を残す流れを確認する",
    },
  },
  activity: {
    slug: "activity",
    shortLabel: "活動記録",
    title: "活動記録ガイド",
    description:
      "ロードマップに沿った日々の学習を記録し、継続と振り返りにつなげるためのガイドです。",
    goal: "学習した内容や気づきをタスクに紐づけて残し、あとから振り返れる形にできるようになります。",
    summary:
      "活動記録はあとで読み返すためだけでなく、サマリーやポートフォリオに変換するための素材としても機能します。",
    sections: [
      section("why", "なぜこの機能を使うのか", [
        "活動記録は、単なる日報ではありません。あとからサマリーやポートフォリオに変換できる素材を残す役割があります。",
        "毎日の学びを小さく残しておくと、続けている実感が生まれやすくなり、学習の可視化にもつながります。",
      ]),
      section("first-step", "最初にやること", [
        "ロードマップの中から今取り組んでいるタスクを選び、その日の学習内容を短く記録してみてください。",
        "最初は長文にする必要はありません。何を学んだか、どこで詰まったか、次に何をするかの三点だけでも十分です。",
      ]),
      section(
        "flow",
        "使い方の流れ",
        ["活動記録は、ロードマップ詳細の中でタスク単位に残していきます。"],
        "steps",
        [
          {
            title: "記録するタスクを開く",
            location: "ロードマップ詳細ページ → 対象タスクをクリック",
            description:
              "今取り組んでいるタスクを開き、そのタスクに紐づく活動記録エリアへ入ります。記録先を迷ったら、今一番時間を使っているタスクを選べば十分です。",
            href: "/roadmap",
            hrefLabel: "ロードマップ一覧から詳細ページへ進む",
          },
          {
            title: "その日の学習内容を書く",
            location: "活動記録エディタ",
            description:
              "何を学んだか、試したこと、うまくいかなかった点を書きます。長文でなくても、あとで自分が読み返せる具体性があることが重要です。",
            href: "/roadmap",
            hrefLabel: "活動記録エディタを開くためにロードマップへ",
          },
          {
            title: "次の行動を一行残す",
            location: "同じ活動記録エディタの末尾",
            description:
              "次にやることを一文で残しておくと、次回の再開コストが下がります。継続できる人ほど、この一文を活用しています。",
            href: "/roadmap",
            hrefLabel: "続けて同じ記録画面で入力する",
          },
          {
            title: "ステータスを更新する",
            location: "タスク詳細のステータス切り替え",
            description:
              "未着手、進行中、完了を進捗に合わせて更新します。記録とステータスが一致していると、あとで振り返るときに流れが追いやすくなります。",
            href: "/roadmap",
            hrefLabel: "タスク詳細でステータスを更新する",
          },
          {
            title: "記録を振り返りへ回す",
            location: "サマリーページ / ポートフォリオページ",
            description:
              "同じタスクに複数の記録がたまると、サマリー生成や自己PRの素材として使いやすくなります。活動記録は残すだけで終わらず、次の画面で再利用します。",
            href: "/summary",
            hrefLabel: "まずはサマリーページへ",
          },
        ],
      ),
      section(
        "pitfalls",
        "つまずきやすい点",
        [
          "書くことが思いつかない日は、学習した技術名と一行の気づきだけで始めて問題ありません。",
          "外部サービス連携のデータだけでは、学びの背景までは伝わりません。自分の言葉で少しでも残しておくと後で効きます。",
        ],
        "callout",
      ),
      section("next", "次に進む先", [
        "記録がたまり始めたら、ポートフォリオ作成・共有ガイドを読み、どう外部に見せる形へつなげるかを確認してください。",
      ]),
    ],
    prevLink: {
      href: "/guide/roadmap",
      label: "ロードマップ作成ガイド",
      description: "差分を学習計画に落とし込む流れへ戻る",
    },
    nextLink: {
      href: "/guide/portfolio",
      label: "ポートフォリオ作成・共有ガイドへ",
      description: "学習成果を伝わる形にまとめる",
    },
  },
  portfolio: {
    slug: "portfolio",
    shortLabel: "ポートフォリオ",
    title: "ポートフォリオ作成・共有ガイド",
    description:
      "学習の蓄積を自己PRや強みとして整え、公開ページとして共有するためのガイドです。",
    goal: "学習記録やサマリーをもとに、外部に見せられるポートフォリオの叩き台を作れるようになります。",
    summary:
      "ポートフォリオは完成品を一度で作るものではなく、活動を積み上げながら更新していく共有面として使うのが前提です。",
    sections: [
      section("why", "なぜこの機能を使うのか", [
        "就活や転職では、何を学んだかを自分で整理して伝える必要があります。ポートフォリオ機能は、その共有コストを下げるためにあります。",
        "日々の活動やサマリーを、そのままではなく、相手に伝わる文章へ変換して見せられる形に整えます。",
      ]),
      section("first-step", "最初にやること", [
        "プロフィール情報を入れ、自己PRや強みの叩き台を作るところから始めます。",
        "活動サマリーがある場合は、その内容を使いながら AI で文章を生成し、必要に応じて手で整えます。",
      ]),
      section(
        "flow",
        "使い方の流れ",
        [
          "ポートフォリオページでは、素材を文章化し、公開できる状態まで持っていきます。",
        ],
        "steps",
        [
          {
            title: "基本情報を埋める",
            location: "ポートフォリオページ → 編集モード → プロフィール領域",
            description:
              "表示名、自己紹介、SNS、経歴などを埋めます。ここが空だと全体の説得力が弱く見えるので、まず最小限でもプロフィールを整えます。",
            href: "/portfolio",
            hrefLabel: "ポートフォリオページへ",
          },
          {
            title: "文章の素材を選ぶ",
            location: "左サイドバーの AI チャット / サマリー選択",
            description:
              "活動サマリーがある場合は、対象項目に合わせて選択します。素材が少ない場合は自由入力だけでも始められますが、サマリーがあると文章の一貫性が出やすくなります。",
            href: "/portfolio",
            hrefLabel: "左サイドバーを開く",
          },
          {
            title: "候補文を生成して反映する",
            location: "左サイドバー → 生成実行 → 候補を適用",
            description:
              "自己PR、強み、学び、将来のどこに入れるかを選んで生成します。良い候補が出たら、適用して中央プレビューに反映させます。",
            href: "/portfolio",
            hrefLabel: "生成フローを試す",
          },
          {
            title: "プレビューで見え方を調整する",
            location: "中央プレビュー / 編集モード",
            description:
              "採用担当者が読んだときに伝わる順序になっているかを見ます。言い回しを少し直すだけでも、読みやすさと納得感が大きく変わります。",
            href: "/portfolio",
            hrefLabel: "中央プレビューで確認する",
          },
          {
            title: "保存して公開する",
            location: "保存ボタン → 公開設定モーダル",
            description:
              "Slug と公開状態を設定し、共有 URL を用意します。応募先ごとに内容を少し変えたい場合でも、まずは一つ公開状態を作ると改善サイクルを回しやすくなります。",
            href: "/portfolio",
            hrefLabel: "保存と公開設定へ進む",
          },
        ],
      ),
      section(
        "pitfalls",
        "つまずきやすい点",
        [
          "最初から完成版を目指さなくて構いません。まずは今の学習状況が伝わる叩き台を作り、応募先や目的に合わせて更新する前提で使うのが自然です。",
          "自己PRだけを考え込むよりも、活動記録やサマリーを素材として使う方が書きやすくなります。",
        ],
        "callout",
      ),
      section("next", "次に進む先", [
        "初回導線をもう一度確認したい場合は Getting Started に戻り、全体の流れと各機能のつながりを見直してください。",
      ]),
    ],
    prevLink: {
      href: "/guide/activity",
      label: "活動記録ガイド",
      description: "日々の記録を残す流れへ戻る",
    },
    nextLink: {
      href: "/guide/getting-started",
      label: "Getting Started に戻る",
      description: "初回導線全体を見直す",
    },
  },
};
