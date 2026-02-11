export function getBrewingSteps(methodId, coffee) {
  const roast = coffee?.roastLevel || 'medium';
  const tempAdjust = roast === 'light' || roast === 'light-medium' ? 5 : roast === 'dark' ? -5 : 0;

  const steps = {
    chemex: (coffee) => {
      const baseTemp = 200 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 5}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 42g of coffee to medium-coarse (like sea salt).`, duration: 0 },
        { title: 'Rinse Filter', description: 'Place Chemex filter with 3 layers facing the spout. Rinse with hot water, then discard water.', duration: 15 },
        { title: 'Add Grounds', description: 'Add ground coffee to the filter. Shake gently to level the bed.', duration: 0 },
        { title: 'Bloom', description: 'Pour 80–100g of water in a spiral to saturate all grounds. Let CO₂ escape.', duration: 45, timer: true },
        { title: 'First Pour', description: 'Slowly pour water in concentric circles to reach 300g total.', duration: 30, timer: true },
        { title: 'Second Pour', description: 'Continue pouring in circles to reach 500g total.', duration: 30, timer: true },
        { title: 'Final Pour', description: 'Top up to 630g total. Let it draw down completely.', duration: 120, timer: true },
        { title: 'Serve', description: 'Remove filter. Swirl the Chemex and enjoy your brew.', duration: 0 },
      ];
    },
    v60: (coffee) => {
      const baseTemp = 198 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 7}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 20g of coffee to medium-fine (like table salt).`, duration: 0 },
        { title: 'Rinse Filter', description: 'Place V60 filter in dripper. Rinse thoroughly with hot water. Discard rinse water.', duration: 15 },
        { title: 'Add Grounds', description: 'Add ground coffee. Create a small well in the center.', duration: 0 },
        { title: 'Bloom', description: 'Pour 40–60g of water to saturate grounds. Gently swirl.', duration: 45, timer: true },
        { title: 'Main Pour', description: 'Pour slowly in concentric circles. Keep water level consistent. Target 320g total.', duration: 90, timer: true },
        { title: 'Drawdown', description: 'Let water draw through completely. Give the V60 a gentle swirl.', duration: 60, timer: true },
        { title: 'Serve', description: 'Remove dripper. Total brew time should be ~2:30–3:30.', duration: 0 },
      ];
    },
    kalita: (coffee) => {
      const baseTemp = 198 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 7}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 25g of coffee to medium grind.`, duration: 0 },
        { title: 'Rinse Filter', description: 'Place Kalita Wave filter in dripper. Rinse with hot water and discard.', duration: 15 },
        { title: 'Add Grounds', description: 'Add ground coffee and level the bed.', duration: 0 },
        { title: 'Bloom', description: 'Pour 50g of water gently over grounds.', duration: 45, timer: true },
        { title: 'Pour 1', description: 'Pour to 150g total in gentle circles.', duration: 30, timer: true },
        { title: 'Pour 2', description: 'Pour to 275g total.', duration: 30, timer: true },
        { title: 'Pour 3', description: 'Final pour to 400g total. Let it draw down.', duration: 90, timer: true },
        { title: 'Serve', description: 'Remove dripper. Target total time ~3:30–4:00.', duration: 0 },
      ];
    },
    melitta: (coffee) => {
      const baseTemp = 198 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 7}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 25g of coffee to medium grind.`, duration: 0 },
        { title: 'Rinse Filter', description: 'Place Melitta filter in cone. Rinse with hot water and discard.', duration: 15 },
        { title: 'Add Grounds', description: 'Add ground coffee and level the bed.', duration: 0 },
        { title: 'Bloom', description: 'Pour 50g of water to saturate grounds evenly.', duration: 40, timer: true },
        { title: 'Main Pour', description: 'Pour slowly in circles to 400g total. Keep steady pace.', duration: 120, timer: true },
        { title: 'Drawdown', description: 'Let all water pass through the filter.', duration: 60, timer: true },
        { title: 'Serve', description: 'Remove filter and enjoy.', duration: 0 },
      ];
    },
    frenchPress: (coffee) => {
      const baseTemp = 198 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 7}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 30g of coffee coarsely (like breadcrumbs).`, duration: 0 },
        { title: 'Preheat Press', description: 'Fill French Press with hot water to preheat. Discard water.', duration: 15 },
        { title: 'Add Grounds', description: 'Add ground coffee to the press.', duration: 0 },
        { title: 'Pour Water', description: 'Pour 360g of hot water over the grounds. Make sure all grounds are saturated.', duration: 10, timer: true },
        { title: 'Steep', description: 'Place lid on (don\'t press). Let coffee steep undisturbed.', duration: 240, timer: true },
        { title: 'Break Crust', description: 'Remove lid. Use a spoon to break the crust and skim foam off the top.', duration: 15 },
        { title: 'Press & Serve', description: 'Replace lid and press plunger down slowly and steadily. Serve immediately to avoid over-extraction.', duration: 0 },
      ];
    },
    aeropress: (coffee) => {
      const baseTemp = 185 + tempAdjust;
      return [
        { title: 'Boil Water', description: `Heat water to ${baseTemp}–${baseTemp + 10}°F.`, duration: 0 },
        { title: 'Grind Coffee', description: `Grind 17g of coffee to fine-medium.`, duration: 0 },
        { title: 'Prep AeroPress', description: 'Insert filter into cap. Rinse filter. Attach cap to chamber. Place inverted on scale.', duration: 15 },
        { title: 'Add Coffee & Water', description: 'Add grounds, then pour 220g of water. Stir gently 3 times.', duration: 10, timer: true },
        { title: 'Steep', description: 'Let the coffee steep.', duration: 60, timer: true },
        { title: 'Flip & Press', description: 'Flip AeroPress onto your mug. Press down slowly and steadily for 20–30 seconds.', duration: 30, timer: true },
        { title: 'Serve', description: 'Stop pressing when you hear a hiss. Enjoy your AeroPress coffee.', duration: 0 },
      ];
    },
    espresso: (coffee) => {
      return [
        { title: 'Prep Machine', description: 'Turn on espresso machine. Allow it to heat up fully. Flush the group head.', duration: 0 },
        { title: 'Grind & Dose', description: 'Grind 18–20g of coffee very fine (like powdered sugar). Distribute evenly in portafilter.', duration: 0 },
        { title: 'Tamp', description: 'Tamp with ~30lbs of pressure. Ensure the puck is level.', duration: 0 },
        { title: 'Lock & Brew', description: 'Lock portafilter into group head. Start extraction immediately.', duration: 0 },
        { title: 'Extract', description: 'Target 36–40g out in 25–35 seconds. Watch for a steady, honey-like stream.', duration: 30, timer: true },
        { title: 'Evaluate', description: 'Taste and adjust. Too sour = grind finer or increase time. Too bitter = grind coarser or decrease time.', duration: 0 },
      ];
    },
    mokaPot: (coffee) => {
      return [
        { title: 'Prep Water', description: 'Boil water separately. Fill the bottom chamber to just below the safety valve with hot water.', duration: 0 },
        { title: 'Grind & Fill', description: 'Grind coffee fine (finer than drip, coarser than espresso). Fill the filter basket without tamping.', duration: 0 },
        { title: 'Assemble', description: 'Insert filter basket. Screw top and bottom together tightly. Use a towel — it\'s hot!', duration: 0 },
        { title: 'Heat', description: 'Place on medium-low heat with the lid open. Watch for coffee to emerge.', duration: 120, timer: true },
        { title: 'Watch for Flow', description: 'Coffee should flow out steadily, honey-colored. When it starts sputtering/turning blonde, remove from heat.', duration: 120, timer: true },
        { title: 'Cool & Serve', description: 'Run bottom chamber under cold water to stop extraction. Pour and enjoy.', duration: 0 },
      ];
    },
    turkish: (coffee) => {
      return [
        { title: 'Measure', description: 'Add 1 heaping tablespoon of extra-fine ground coffee per 3oz cup. Add sugar now if desired.', duration: 0 },
        { title: 'Add Water', description: 'Add cold water to the cezve/ibrik. Stir to combine.', duration: 0 },
        { title: 'Heat Slowly', description: 'Place on low heat. Do NOT stir once heating begins. Watch carefully.', duration: 120, timer: true },
        { title: 'First Foam', description: 'When foam rises to the top, remove from heat. Let foam settle slightly.', duration: 15, timer: true },
        { title: 'Second Rise', description: 'Return to heat. Let foam rise again. Remove from heat.', duration: 30, timer: true },
        { title: 'Serve', description: 'Pour slowly into cup, allowing grounds to settle. Wait 1–2 minutes before sipping. Do not drink the last sip (grounds).', duration: 0 },
      ];
    },
    coldBrew: (coffee) => {
      return [
        { title: 'Grind Coffee', description: 'Grind 100g of coffee extra coarse (like raw sugar / peppercorns).', duration: 0 },
        { title: 'Combine', description: 'Add grounds to a large jar or cold brew maker. Pour 800g of cold or room-temperature filtered water over grounds.', duration: 0 },
        { title: 'Stir', description: 'Stir gently to ensure all grounds are saturated.', duration: 0 },
        { title: 'Steep', description: 'Cover and refrigerate for 12–24 hours. 16 hours is a good middle ground.', duration: 0 },
        { title: 'Filter', description: 'Strain through a fine mesh sieve, then through a paper filter for extra clarity.', duration: 0 },
        { title: 'Serve', description: 'This is a concentrate. Dilute 1:1 with water or milk. Store in fridge for up to 2 weeks.', duration: 0 },
      ];
    },
  };

  const generator = steps[methodId];
  if (!generator) return [];
  return generator(coffee);
}
