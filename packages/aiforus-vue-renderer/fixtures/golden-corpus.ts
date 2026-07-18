import type { Action, PPTElement, Scene, Slide, SlideTheme } from '@aiforus/dsl';

const theme: SlideTheme = {
  backgroundColor: '#ffffff',
  themeColors: ['#2563eb', '#7c3aed', '#0f766e', '#ea580c'],
  fontColor: '#172033',
  fontName: 'Microsoft YaHei',
};

function text(
  id: string,
  content: string,
  left: number,
  top: number,
  width: number,
  height: number,
  options: Partial<Extract<PPTElement, { type: 'text' }>> = {},
): Extract<PPTElement, { type: 'text' }> {
  return {
    id,
    type: 'text',
    left,
    top,
    width,
    height,
    rotate: 0,
    content,
    defaultFontName: 'Microsoft YaHei',
    defaultColor: '#172033',
    ...options,
  };
}

function shape(
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fill: string,
  options: Partial<Extract<PPTElement, { type: 'shape' }>> = {},
): Extract<PPTElement, { type: 'shape' }> {
  return {
    id,
    type: 'shape',
    left,
    top,
    width,
    height,
    rotate: 0,
    viewBox: [1, 1],
    path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
    fixedRatio: false,
    fill,
    ...options,
  };
}

function line(
  id: string,
  left: number,
  top: number,
  end: [number, number],
  options: Partial<Extract<PPTElement, { type: 'line' }>> = {},
): Extract<PPTElement, { type: 'line' }> {
  return {
    id,
    type: 'line',
    left,
    top,
    width: 3,
    start: [0, 0],
    end,
    style: 'solid',
    color: '#334155',
    points: ['', ''],
    ...options,
  };
}

function scene(
  id: string,
  order: number,
  title: string,
  elements: PPTElement[],
  actions: Action[],
  background = '#ffffff',
): Scene {
  const canvas: Slide = {
    id: `${id}-canvas`,
    viewportSize: 1000,
    viewportRatio: 0.5625,
    theme,
    elements,
    background: { type: 'solid', color: background },
  };
  return {
    id,
    stageId: 'golden-stage',
    type: 'slide',
    title,
    order,
    content: { type: 'slide', schemaVersion: 1, canvas },
    actions,
  };
}

export interface GoldenCorpusCase {
  id: string;
  covers: string[];
  scene: Scene;
}

export const goldenCorpus: GoldenCorpusCase[] = [
  {
    id: 'language-long-text',
    covers: [
      'Chinese',
      'English',
      'short title',
      'long title',
      'paragraphs',
      'bullets',
      'missing font',
    ],
    scene: scene(
      'golden-language',
      0,
      '中英文与长文本',
      [
        text(
          'language-title',
          '<p style="font-size:36px;text-align:center"><strong>从 Classification 到 分类：同一概念在中英文课堂中的清晰表达</strong></p>',
          50,
          40,
          900,
          82,
        ),
        shape('language-card-left', 55, 150, 420, 340, '#eff6ff', { groupId: 'language-cards' }),
        shape('language-card-right', 525, 150, 420, 340, '#f5f3ff', { groupId: 'language-cards' }),
        text(
          'language-chinese',
          '<p style="font-size:24px"><strong>中文要点</strong></p><p style="font-size:18px">分类模型根据已标注样本学习类别边界。</p><ul><li>输入：特征</li><li>输出：离散标签</li><li>评价：准确率与召回率</li></ul>',
          85,
          180,
          360,
          270,
        ),
        text(
          'language-english',
          '<p style="font-size:24px"><strong>English summary</strong></p><p style="font-size:18px">A classifier learns a decision boundary from labeled examples.</p><ul><li>Input: features</li><li>Output: a discrete label</li><li>Check precision and recall</li></ul>',
          555,
          180,
          360,
          270,
          { defaultFontName: 'Definitely Missing Classroom Font' },
        ),
      ],
      [
        { id: 'language-focus-zh', type: 'spotlight', elementId: 'language-chinese' },
        { id: 'language-speech-zh', type: 'speech', text: '先用中文建立分类的核心结构。' },
        { id: 'language-focus-en', type: 'laser', elementId: 'language-english', color: '#7c3aed' },
        {
          id: 'language-speech-en',
          type: 'speech',
          text: 'Then connect the same idea to its English terminology.',
        },
      ],
    ),
  },
  {
    id: 'math-physics-diagram',
    covers: ['mathematics', 'formula', 'physics diagram', 'grouped elements', 'rotated element'],
    scene: scene(
      'golden-physics',
      1,
      '力与运动',
      [
        text(
          'physics-title',
          '<p style="font-size:34px"><strong>牛顿第二定律：合力决定加速度</strong></p>',
          55,
          40,
          890,
          72,
        ),
        shape('physics-ground', 100, 430, 800, 20, '#64748b'),
        shape('physics-block', 390, 265, 220, 145, '#dbeafe', {
          groupId: 'physics-body',
          rotate: -4,
        }),
        text(
          'physics-block-label',
          '<p style="font-size:24px;text-align:center"><strong>m</strong></p>',
          450,
          310,
          100,
          45,
          { groupId: 'physics-body' },
        ),
        line('physics-force', 610, 330, [210, 0], { color: '#dc2626', points: ['', 'arrow'] }),
        text(
          'physics-force-label',
          '<p style="font-size:20px"><strong>F</strong></p>',
          710,
          285,
          70,
          42,
        ),
        line('physics-acceleration', 500, 255, [150, -80], {
          color: '#2563eb',
          points: ['', 'arrow'],
        }),
        text(
          'physics-acceleration-label',
          '<p style="font-size:18px"><strong>a</strong></p>',
          625,
          155,
          60,
          38,
        ),
        {
          id: 'physics-formula',
          type: 'latex',
          left: 310,
          top: 485,
          width: 380,
          height: 58,
          rotate: 0,
          latex: '\\vec{F}_{net}=m\\vec{a}',
          align: 'center',
        },
      ],
      [
        { id: 'physics-focus-block', type: 'spotlight', elementId: 'physics-block' },
        { id: 'physics-speech-block', type: 'speech', text: '先确定受力对象和质量。' },
        { id: 'physics-laser-force', type: 'laser', elementId: 'physics-force', color: '#dc2626' },
        { id: 'physics-speech-force', type: 'speech', text: '红色箭头表示水平方向的合力。' },
        { id: 'physics-focus-formula', type: 'spotlight', elementId: 'physics-formula' },
        { id: 'physics-speech-formula', type: 'speech', text: '公式把方向和大小统一起来。' },
      ],
      '#f8fafc',
    ),
  },
  {
    id: 'chemistry-history-timeline',
    covers: ['chemistry notation', 'history timeline', 'multiple paragraphs'],
    scene: scene(
      'golden-chemistry-history',
      2,
      '科学观念如何演进',
      [
        text(
          'timeline-title',
          '<p style="font-size:34px"><strong>从原子学说到现代化学键</strong></p>',
          55,
          40,
          890,
          70,
        ),
        line('timeline-axis', 100, 300, [800, 0], {
          width: 4,
          color: '#0f766e',
          points: ['', 'arrow'],
        }),
        ...([
          ['1803', '道尔顿', 130, '#ccfbf1'],
          ['1869', '元素周期表', 345, '#dbeafe'],
          ['1913', '玻尔模型', 560, '#ede9fe'],
          ['1927', '量子化学', 775, '#ffedd5'],
        ].flatMap(([year, label, left, fill], index) => [
          shape(`timeline-node-${index}`, Number(left), 270, 28, 60, String(fill)),
          text(
            `timeline-year-${index}`,
            `<p style="font-size:18px;text-align:center"><strong>${year}</strong></p>`,
            Number(left) - 35,
            205,
            100,
            45,
          ),
          text(
            `timeline-label-${index}`,
            `<p style="font-size:16px;text-align:center">${label}</p>`,
            Number(left) - 55,
            350,
            140,
            55,
          ),
        ]) as PPTElement[]),
        {
          id: 'chemistry-formula',
          type: 'latex',
          left: 300,
          top: 445,
          width: 400,
          height: 68,
          rotate: 0,
          latex: '2H_2 + O_2 \\rightarrow 2H_2O',
          align: 'center',
        },
      ],
      [
        { id: 'timeline-focus', type: 'spotlight', elementId: 'timeline-axis' },
        { id: 'timeline-speech', type: 'speech', text: '时间轴显示模型如何随证据逐步修正。' },
        { id: 'chemistry-focus', type: 'laser', elementId: 'chemistry-formula' },
        { id: 'chemistry-speech', type: 'speech', text: '化学方程式则强调原子守恒。' },
      ],
    ),
  },
  {
    id: 'media-table-chart-actions',
    covers: [
      'images with different aspect ratios',
      'table',
      'chart',
      'spotlight',
      'speech',
      'laser',
      'video',
    ],
    scene: scene(
      'golden-media-data',
      3,
      '多媒体与数据证据',
      [
        text(
          'media-title',
          '<p style="font-size:34px"><strong>同一结论需要多种证据</strong></p>',
          55,
          35,
          890,
          70,
        ),
        {
          id: 'media-wide-image',
          type: 'image',
          left: 55,
          top: 130,
          width: 270,
          height: 120,
          rotate: 0,
          fixedRatio: true,
          src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="360" height="120"%3E%3Crect width="360" height="120" fill="%23dbeafe"/%3E%3C/svg%3E',
        },
        {
          id: 'media-tall-image',
          type: 'image',
          left: 355,
          top: 130,
          width: 120,
          height: 210,
          rotate: 0,
          fixedRatio: true,
          src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="300"%3E%3Crect width="120" height="300" fill="%23ede9fe"/%3E%3C/svg%3E',
        },
        {
          id: 'media-chart',
          type: 'chart',
          left: 510,
          top: 120,
          width: 430,
          height: 210,
          rotate: 0,
          chartType: 'column',
          data: {
            labels: ['A', 'B', 'C'],
            legends: ['实验组', '对照组'],
            series: [
              [68, 82, 91],
              [60, 63, 65],
            ],
          },
          themeColors: ['#2563eb', '#f97316'],
        },
        {
          id: 'media-table',
          type: 'table',
          left: 55,
          top: 380,
          width: 540,
          height: 135,
          rotate: 0,
          outline: { style: 'solid', width: 1, color: '#cbd5e1' },
          colWidths: [0.34, 0.33, 0.33],
          cellMinHeight: 36,
          data: [
            [
              { id: 'media-cell-h1', colspan: 1, rowspan: 1, text: '证据' },
              { id: 'media-cell-h2', colspan: 1, rowspan: 1, text: '优势' },
              { id: 'media-cell-h3', colspan: 1, rowspan: 1, text: '限制' },
            ],
            [
              { id: 'media-cell-r1', colspan: 1, rowspan: 1, text: '图像' },
              { id: 'media-cell-r2', colspan: 1, rowspan: 1, text: '直观' },
              { id: 'media-cell-r3', colspan: 1, rowspan: 1, text: '需要解释' },
            ],
          ],
        },
        {
          id: 'media-video',
          type: 'video',
          left: 650,
          top: 375,
          width: 290,
          height: 163,
          rotate: 0,
          autoplay: false,
          poster:
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect width="320" height="180" fill="%230f172a"/%3E%3C/svg%3E',
          src: 'https://example.invalid/golden-video.mp4',
        },
      ],
      [
        { id: 'media-focus-chart', type: 'spotlight', elementId: 'media-chart' },
        { id: 'media-speech-chart', type: 'speech', text: '先比较两组数据的变化趋势。' },
        { id: 'media-laser-table', type: 'laser', elementId: 'media-table', color: '#f97316' },
        { id: 'media-speech-table', type: 'speech', text: '再用表格核对不同证据的优势与限制。' },
        { id: 'media-focus-video', type: 'spotlight', elementId: 'media-video' },
        { id: 'media-speech-video', type: 'speech', text: '最后通过短视频观察动态过程。' },
        { id: 'media-play-video', type: 'play_video', elementId: 'media-video' },
      ],
      '#f8fafc',
    ),
  },
];
