function welcomeStepIcon(raw, size = 14) {
  return raw.replace("<svg ", `<svg width="${size}" height="${size}" `);
}

export { welcomeStepIcon };
