function probeDocumentOperability() {
  try {
    const root2 = document.documentElement ?? document.body;
    if (!root2) return false;
    const probe = document.createElement("div");
    probe.style.display = "none";
    root2.appendChild(probe);
    const ok = probe.isConnected;
    probe.remove();
    return ok;
  } catch {
    return false;
  }
}

export { probeDocumentOperability };
