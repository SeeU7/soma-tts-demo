import { mkdir, readdir, readFile, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-samples.mjs <sample-directory>');
const root = path.resolve(import.meta.dirname, '..');
const models = ['CosyVoice2', 'CosyVoice3', 'Qwen3-TTS-AC'];
const tasks = ['APS', 'DSD', 'RP'];
const samples = [];

for (const model of models) {
  for (const task of tasks) {
    const taskPath = path.join(source, model, task);
    const ranks = (await readdir(taskPath, { withFileTypes: true }))
      .filter(entry => entry.isDirectory() && /^rank_\d+_(en|zh)_\d+$/.test(entry.name))
      .map(entry => entry.name).sort();
    if (ranks.length !== 10) throw new Error(`${model}/${task}: expected 10 samples, got ${ranks.length}`);
    for (const rankName of ranks) {
      const from = path.join(taskPath, rankName);
      const info = JSON.parse(await readFile(path.join(from, 'info.json'), 'utf8'));
      const instruction = (await readFile(path.join(from, 'instruction.txt'), 'utf8')).trim();
      const to = path.join(root, 'audio', model, task, rankName);
      await mkdir(to, { recursive: true });
      await Promise.all(['baseline.wav', 'method.wav'].map(file => copyFile(path.join(from, file), path.join(to, file))));
      samples.push({
        model, task, rank: Number(rankName.match(/^rank_(\d+)/)[1]),
        id: info.sample_id, lang: info.lang, instruction,
        baseline: `audio/${model}/${task}/${rankName}/baseline.wav`,
        method: `audio/${model}/${task}/${rankName}/method.wav`
      });
    }
  }
}
await writeFile(path.join(root, 'samples.json'), JSON.stringify(samples, null, 2) + '\n');
console.log(`Prepared ${samples.length} sample pairs.`);
