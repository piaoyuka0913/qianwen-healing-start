import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CloudLightning,
  Download,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  MonitorPlay,
  Palette,
  Presentation,
  RefreshCcw,
  Rocket,
  Share2,
  Sparkles,
  TimerReset,
  Wand2,
} from 'lucide-react';
import './styles.css';

const emotions = [
  { id: 'anxious', label: '焦虑', hint: '脑子很满，越想越慌', icon: CloudLightning },
  { id: 'delay', label: '拖延', hint: '知道要做，但迟迟没动', icon: TimerReset },
  { id: 'lost', label: '迷茫', hint: '不知道先做什么', icon: BrainCircuit },
  { id: 'urgent', label: '时间紧张', hint: '截止时间正在靠近', icon: Clock3 },
  { id: 'empty', label: '灵感枯竭', hint: '想不出新角度', icon: Lightbulb },
];

const tasks = [
  { id: 'ppt', label: 'PPT', icon: Presentation },
  { id: 'paper', label: '论文', icon: FileText },
  { id: 'research', label: '调研报告', icon: LayoutDashboard },
  { id: 'poster', label: '海报', icon: ImageIcon },
  { id: 'video', label: '短视频', icon: MonitorPlay },
  { id: 'course', label: '课程设计', icon: CalendarClock },
  { id: 'ui', label: 'UI设计', icon: Palette },
  { id: 'web', label: '互动网页', icon: Wand2 },
];

const flowSteps = ['情绪识别', '任务识别', '方案拆解', '生成开工清单'];

const taskGuides = {
  ppt: {
    blocks: ['主题与受众', '页面结构', '视觉风格', '重点页文案'],
    firstSteps: ['写下标题和一句核心观点', '列 4 个章节标题', '先做封面和目录的低保真草稿'],
    later: ['补齐每页论据', '统一字体与配色', '完成 1 次讲述彩排'],
  },
  paper: {
    blocks: ['研究问题', '资料检索', '论证框架', '初稿段落'],
    firstSteps: ['把题目改写成 1 个问题', '找 3 条可引用资料', '写出引言第一段的粗稿'],
    later: ['整理参考文献', '补足案例或数据', '检查格式与重复表述'],
  },
  research: {
    blocks: ['调研目标', '样本与方法', '发现总结', '建议方案'],
    firstSteps: ['明确调研对象和目的', '列 5 个访谈或问卷问题', '先搭报告目录'],
    later: ['补充数据图表', '提炼 3 条关键洞察', '写出行动建议'],
  },
  poster: {
    blocks: ['传播目标', '主视觉', '层级信息', '输出尺寸'],
    firstSteps: ['写 1 句海报主标题', '确定 2 个关键词', '画出标题/图片/信息区位置'],
    later: ['收敛配色', '替换高清素材', '检查远距离可读性'],
  },
  video: {
    blocks: ['选题钩子', '脚本分镜', '素材清单', '剪辑节奏'],
    firstSteps: ['写开头 5 秒钩子', '列 3 个镜头画面', '确定结尾行动提示'],
    later: ['补拍或找素材', '加入字幕与转场', '导出前检查声音'],
  },
  course: {
    blocks: ['课程目标', '学习路径', '活动设计', '评价方式'],
    firstSteps: ['写出学习者完成后的变化', '拆成 3 个知识模块', '设计 1 个课堂小任务'],
    later: ['补充案例材料', '完善评价表', '调整课程节奏'],
  },
  ui: {
    blocks: ['用户场景', '关键流程', '页面布局', '组件规范'],
    firstSteps: ['写 1 个典型用户任务', '画 3 步核心流程', '做首页低保真线框'],
    later: ['完善状态与空页面', '统一组件间距', '做移动端适配检查'],
  },
  web: {
    blocks: ['互动目标', '页面流程', '状态反馈', '发布适配'],
    firstSteps: ['写清首屏标题和按钮', '列出 5 个页面状态', '先完成一个可点击原型'],
    later: ['补齐动效与分享页', '检查移动端布局', '准备部署说明'],
  },
};

const emotionCare = {
  anxious: '你不是能力不够，只是任务在脑海里叠成了一团。我们先把它摊开，一次只处理一小块。',
  delay: '拖延不是失败信号，它常常是在提醒你入口太大。把入口缩小到 5 分钟，事情就会开始松动。',
  lost: '迷茫时不用急着找到完美答案，先找到一个能验证的方向。开始之后，路线会变清楚。',
  urgent: '时间紧张时，最重要的不是把所有事同时做好，而是先保住主线，再逐步补细节。',
  empty: '灵感枯竭不是空白，而是素材还没被重新排列。我们先用结构把想法接住。',
};

const emotionAction = {
  anxious: '先降噪：只保留“下一步能做什么”。',
  delay: '先降低启动成本：从最小动作开始。',
  lost: '先定方向：让问题变成可选择的路径。',
  urgent: '先排优先级：完成核心，再优化表达。',
  empty: '先补素材：用关键词激活联想。',
};

function App() {
  const [step, setStep] = useState(0);
  const [emotion, setEmotion] = useState('');
  const [task, setTask] = useState('');
  const [stuckText, setStuckText] = useState('');
  const [activeFlow, setActiveFlow] = useState(0);

  const selectedEmotion = emotions.find((item) => item.id === emotion);
  const selectedTask = tasks.find((item) => item.id === task);
  const result = useMemo(
    () => buildResult({ emotion, task, stuckText }),
    [emotion, task, stuckText]
  );

  useEffect(() => {
    if (step !== 4) return;

    setActiveFlow(0);
    const timers = flowSteps.map((_, index) =>
      window.setTimeout(() => setActiveFlow(index), index * 760)
    );
    const doneTimer = window.setTimeout(() => setStep(5), 3600);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(doneTimer);
    };
  }, [step]);

  const canContinue =
    (step === 1 && emotion) ||
    (step === 2 && task) ||
    (step === 3 && stuckText.trim().length >= 2);

  function restart() {
    setStep(0);
    setEmotion('');
    setTask('');
    setStuckText('');
    setActiveFlow(0);
  }

  return (
    <main className="app-shell">
      <Decor />
      <section className={step === 0 ? 'stage home-stage' : 'stage'} aria-label="开工疗愈站互动网页">
        <TopBar step={step} />

        <div className="content-area">
          {step === 0 && <Home onStart={() => setStep(1)} />}
          {step === 1 && (
            <ChoicePage
              eyebrow="第一步：听见状态"
              title="你现在更像哪一种卡住？"
              subtitle="选择一个最接近的状态，千问会先理解情绪，再开始拆任务。"
              items={emotions}
              selected={emotion}
              onSelect={setEmotion}
            />
          )}
          {step === 2 && (
            <ChoicePage
              eyebrow="第二步：识别任务"
              title="今天想启动哪类学习任务？"
              subtitle="不同任务会进入不同的拆解路径，先选一个最主要的。"
              items={tasks}
              selected={task}
              onSelect={setTask}
              compact
            />
          )}
          {step === 3 && (
            <InputPage
              emotion={selectedEmotion}
              task={selectedTask}
              value={stuckText}
              onChange={setStuckText}
            />
          )}
          {step === 4 && (
            <AnalysisPage
              activeFlow={activeFlow}
              emotion={selectedEmotion}
              task={selectedTask}
            />
          )}
          {step === 5 && (
            <ResultPage
              result={result}
              emotion={selectedEmotion}
              task={selectedTask}
              onShare={() => setStep(6)}
            />
          )}
          {step === 6 && (
            <SharePage
              result={result}
              emotion={selectedEmotion}
              task={selectedTask}
              onRestart={restart}
            />
          )}
        </div>

        {step > 0 && step < 5 && (
          <FooterNav
            onBack={() => setStep((current) => Math.max(current - 1, 0))}
            onNext={() => setStep((current) => Math.min(current + 1, 6))}
            nextDisabled={!canContinue}
            nextLabel={step === 3 ? '开始分析' : '下一步'}
          />
        )}
      </section>
    </main>
  );
}

function Decor() {
  return (
    <>
      <div className="soft-orb orb-orange" />
      <div className="soft-orb orb-blue" />
      <div className="soft-orb orb-purple" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="tech-grid" />
    </>
  );
}

function TopBar({ step }) {
  return (
    <header className="top-bar">
      <div className="brand-chip">
        <Sparkles size={15} />
       
      </div>
      <div className="step-dots" aria-label={`当前第 ${step + 1} 步`}>
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index} className={index <= step ? 'dot active' : 'dot'} />
        ))}
      </div>
    </header>
  );
}

function Home({ onStart }) {
  return (
    <div className="home page-enter">
      <img className="official-logo" src="/aliyun-qwen-logo.png" alt="阿里云 × 千问大模型" />

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-card card-left">
          <span>情绪识别</span>
        </div>
        <div className="hero-card card-right">
          <span>开工清单</span>
        </div>
        <div className="ai-core">
          <BrainCircuit size={56} />
        </div>
        <div className="hero-ring ring-one" />
        <div className="hero-ring ring-two" />
        <span className="signal signal-a" />
        <span className="signal signal-b" />
        <span className="signal signal-c" />
      </div>

      <p className="eyebrow">阿里云 × 千问大模型 · 学习陪伴互动 H5</p>
      <h1>开工疗愈站</h1>
      <p className="slogan">帮你跨过最难的开头</p>
      <p className="support">
        千问大模型陪你从焦虑、拖延和卡住中拆出第一步，把模糊任务变成今天就能行动的开工清单。
      </p>

      <button className="primary-btn hero-btn" type="button" onClick={onStart}>
        <Rocket size={19} />
        开始开工
      </button>
    </div>
  );
}

function ChoicePage({ eyebrow, title, subtitle, items, selected, onSelect, compact = false }) {
  return (
    <div className="page-enter">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>

      <div className={compact ? 'choice-grid compact' : 'choice-grid'}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={selected === item.id ? 'choice-card selected' : 'choice-card'}
              onClick={() => onSelect(item.id)}
            >
              <span className="choice-icon">
                <Icon size={22} />
              </span>
              <span>
                <strong>{item.label}</strong>
                {item.hint && <small>{item.hint}</small>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InputPage({ emotion, task, value, onChange }) {
  return (
    <div className="page-enter input-page">
      <p className="eyebrow">第三步：说出卡点</p>
      <h2>把现在最卡的地方写下来</h2>
      <p className="subtitle">
        当前状态：{emotion?.label || '待选择'} / 任务：{task?.label || '待选择'}
      </p>
      <label className="text-panel">
        <span>我的卡点</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="例如：PPT 主题定了，但不知道怎么分章节，也怕做出来太普通。"
          maxLength={180}
        />
        <em>{value.length}/180</em>
      </label>
      <div className="tip-card">
        <Sparkles size={18} />
        <p>可以很短，也可以很乱。千问会先整理情绪，再把任务拆成能马上执行的小动作。</p>
      </div>
    </div>
  );
}

function AnalysisPage({ activeFlow, emotion, task }) {
  return (
    <div className="analysis page-enter">
      <div className="scanner">
        <div className="scanner-ring" />
        <BrainCircuit size={58} />
      </div>
      <p className="eyebrow">千问正在帮你</p>
      <h2>从情绪到行动，正在生成你的开工方案</h2>
      <div className="flow-list">
        {flowSteps.map((item, index) => (
          <div
            key={item}
            className={
              index < activeFlow
                ? 'flow-item done'
                : index === activeFlow
                  ? 'flow-item active'
                  : 'flow-item'
            }
          >
            <span>{index < activeFlow ? <CheckCircle2 size={17} /> : index + 1}</span>
            <strong>{item}</strong>
            <small>
              {index === 0 && `检测到：${emotion?.label || '学习压力'}`}
              {index === 1 && `识别为：${task?.label || '学习任务'}`}
              {index === 2 && '匹配可执行任务结构'}
              {index === 3 && '生成 30 分钟低压力启动路径'}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPage({ result, emotion, task, onShare }) {
  return (
    <div className="result page-enter">
      <p className="eyebrow">你的开工方案已生成</p>
      <h2>{emotion?.label || '当前状态'}也可以开始一点点</h2>

      <section className="result-block healing">
        <h3>治愈回应</h3>
        <p>{result.care}</p>
      </section>

      <section className="result-block">
        <h3>{task?.label || '任务'}拆解</h3>
        <div className="tag-row">
          {result.blocks.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="result-block">
        <h3>30 分钟开工清单</h3>
        <ol className="check-list">
          {result.firstSteps.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="result-block">
        <h3>后续计划</h3>
        <ul className="plain-list">
          {result.later.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>


      <button className="primary-btn wide" type="button" onClick={onShare}>
        <Share2 size={18} />
        生成今日开工卡
      </button>
    </div>
  );
}

function SharePage({ result, emotion, task, onRestart }) {
  const today = new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date());

  return (
    <div className="share-page page-enter">
      <p className="eyebrow">适合截图保存</p>
      <h2>今日开工卡</h2>

      <article className="share-card">
        <div className="share-card-top">
          <span>{today}</span>
          <Sparkles size={18} />
        </div>
        <h3>今天先开始 30 分钟</h3>
        <p className="quote">{result.action}</p>
        <div className="share-meta">
          <span>{emotion?.label || '状态'}</span>
          <span>{task?.label || '任务'}</span>
        </div>
        <div className="mini-plan">
          {result.firstSteps.map((item, index) => (
            <p key={item}>
              <strong>{index + 1}</strong>
              {item}
            </p>
          ))}
        </div>
        <footer>
          <span>开工疗愈站</span>
          <span>阿里云主题互动 H5 · 千问工作流模拟</span>
        </footer>
      </article>

     

      <div className="share-actions">
        <button className="secondary-btn" type="button" onClick={onRestart}>
          <RefreshCcw size={17} />
          再来一次
        </button>
        <button className="primary-btn" type="button" onClick={() => window.print()}>
          <Download size={17} />
          打印/保存
        </button>
      </div>
    </div>
  );
}

function FooterNav({ onBack, onNext, nextDisabled, nextLabel }) {
  return (
    <footer className="footer-nav">
      <button className="ghost-btn" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回
      </button>
      <button className="primary-btn" type="button" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
        <ArrowRight size={18} />
      </button>
    </footer>
  );
}

function buildResult({ emotion, task, stuckText }) {
  const guide = taskGuides[task] || taskGuides.web;
  const cleanText = stuckText.trim();
  const personalNote = cleanText
    ? `你提到“${cleanText.slice(0, 42)}${cleanText.length > 42 ? '...' : ''}”，这已经是一个很好的入口。`
    : '你已经完成了最难的一步：承认自己卡住，并愿意往前挪一点。';

  return {
    care: `${emotionCare[emotion] || emotionCare.lost} ${personalNote}`,
    action: emotionAction[emotion] || emotionAction.lost,
    blocks: guide.blocks,
    firstSteps: guide.firstSteps,
    later: guide.later,
  };
}

createRoot(document.getElementById('root')).render(<App />);
