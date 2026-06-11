const DEFAULT_RESULT = {
  title: '今天先开始30分钟',
  care: '先不用把整件事想完。把入口缩小到一个能立刻做的小动作，就已经是在开始了。',
  steps: ['写下任务的最终交付物', '列出最小的三件待办', '先完成其中最容易的一件'],
  tips: ['先做粗糙版本，不急着完美', '不要一边找资料一边改格式，容易被细节拖住'],
  summary: '今天不用完成全部，先把第一步稳稳做出来。',
};

const SYSTEM_PROMPT =
  '你是“开工疗愈站”的学习陪伴智能体，面向大学生期末作业、论文、PPT、调研报告、UI设计、互动网页等任务。你的任务不是替用户完成作业，而是帮助用户降低启动成本，把焦虑、拖延、卡住的状态拆成今天能开始的第一步。回答要温和、具体、短句、可执行。不要直接代写完整作业，不要编造引用，不要输出论文式长篇解释。';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY' });
    }

    const body = parseBody(req.body);
    const emotion = String(body.emotion || '').slice(0, 60);
    const task = String(body.task || '').slice(0, 60);
    const stuckText = String(body.stuckText || '').slice(0, 600);

    const userPrompt = [
      `emotion: ${emotion || '未选择'}`,
      `task: ${task || '未选择'}`,
      `stuckText: ${stuckText || '用户暂时没有详细描述'}`,
      '',
      '请只返回 JSON，不要 Markdown，不要代码块。JSON 格式必须是：',
      '{',
      '  "title": "今天先开始30分钟",',
      '  "care": "一句情绪安抚，但不要鸡汤",',
      '  "steps": ["第一步", "第二步", "第三步"],',
      '  "tips": ["一个小提醒", "一个避坑点"],',
      '  "summary": "一句适合分享卡的总结"',
      '}',
    ].join('\n');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.45,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      return res.status(response.status).json({
        error: 'DeepSeek request failed',
        detail: message.slice(0, 300),
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseModelJson(content);

    return res.status(200).json(normalizeResult(parsed));
  } catch (error) {
    return res.status(500).json({
      error: 'Generate failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      fallback: DEFAULT_RESULT,
    });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function parseModelJson(content) {
  const cleaned = String(content)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return DEFAULT_RESULT;

    try {
      return JSON.parse(match[0]);
    } catch {
      return DEFAULT_RESULT;
    }
  }
}

function normalizeResult(result) {
  const title = typeof result.title === 'string' ? result.title.trim() : '';
  const care = typeof result.care === 'string' ? result.care.trim() : '';
  const summary = typeof result.summary === 'string' ? result.summary.trim() : '';
  const steps = Array.isArray(result.steps)
    ? result.steps.map((item) => String(item).trim()).filter(Boolean).slice(0, 4)
    : [];
  const tips = Array.isArray(result.tips)
    ? result.tips.map((item) => String(item).trim()).filter(Boolean).slice(0, 4)
    : [];

  return {
    title: title || DEFAULT_RESULT.title,
    care: care || DEFAULT_RESULT.care,
    steps: steps.length ? steps : DEFAULT_RESULT.steps,
    tips: tips.length ? tips : DEFAULT_RESULT.tips,
    summary: summary || DEFAULT_RESULT.summary,
  };
}
