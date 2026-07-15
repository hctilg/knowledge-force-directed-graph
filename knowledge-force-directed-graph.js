const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.onresize = resize;

// build a Set of every unique label that appears in the edges
const unique_labels = new Set();

// add both the source and target of each edge
edges.forEach(([src, dst]) => {
  unique_labels.add(src);
  unique_labels.add(dst);
});

// convert the Set into the desired array of objects
const nodes = Array.from(unique_labels, label => ({ id: label }));

// random initial positions
nodes.forEach(n => {
  n.x = Math.random() * canvas.width;
  n.y = Math.random() * canvas.height;

  n.vx = 0;
  n.vy = 0;

  n.radius = 28;
});

const get_node = id => nodes.find(n => n.id === id);

const physics = () => { // repulsion model
  for(let i = 0; i < nodes.length; i++){
    for(let j = i + 1;j < nodes.length; j++){
      let a = nodes[i];
      let b = nodes[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;

      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = 1800 / (dist * dist);
      
      let fx = dx / dist * force;
      let fy = dy / dist * force;

      a.vx -= fx;
      a.vy -= fy;

      b.vx += fx;
      b.vy += fy;
    }
  }

  edges.forEach(e => { // spring edges
    let a = get_node(e[0]);
    let b = get_node(e[1]);

    let dx = b.x - a.x;
    let dy = b.y - a.y;

    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let target = 170;

    let force = (dist - target) * 0.005;

    let fx = dx / dist * force;
    let fy = dy / dist * force;

    a.vx += fx;
    a.vy += fy;

    b.vx -= fx;
    b.vy -= fy;
  });

  nodes.forEach(n => { // center gravity
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    n.vx += (cx - n.x) * 0.0005;
    n.vy += (cy - n.y) * 0.0005;
  });

  nodes.forEach(n => {
    n.x += n.vx;
    n.y += n.vy;
    
    n.vx *= 0.85;
    n.vy *= 0.85;

    // keep inside screen
    if (n.x < 50) n.vx += 1;
    if (n.x > canvas.width - 50) n.vx -= 1;
    if (n.y < 50) n.vy += 1;
    if (n.y > canvas.height - 50) n.vy -= 1;
  });
}

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // edges
  edges.forEach(e => {
    let a = get_node(e[0]);
    let b = get_node(e[1]);

    ctx.beginPath();

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.font = "13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(n.id, n.x, n.y + n.radius + 18);
  });
}

const animate = () => {
  physics();
  draw();
  requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", animate);
