const queue = [];
let processing = false;

function enqueue(task) {
  queue.push(task);
  if (!processing) process();
}

async function process() {
  processing = true;
  while (queue.length > 0) {
    const task = queue.shift();
    try {
      await task();
    } catch (err) {
      console.error('Email job failed:', err.message);
    }
  }
  processing = false;
}

module.exports = { enqueue };
