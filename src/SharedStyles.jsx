var DZ_SLIDER_CSS_STANDARD =
  "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";

var DZ_SLIDER_CSS_FINANCE =
  "input[type=range].dz-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; border: none; } input[type=range].dz-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.18); } input[type=range].conscience-sl::-webkit-slider-thumb { background: #7c3aed; } input[type=range].pull-sl::-webkit-slider-thumb { background: #0891b2; } input[type=range].fluency-sl::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #d97706; border: 2px solid white; cursor: pointer; }";

var DZ_SLIDER_CSS_LOCALIZATION =
  "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2}";

var UX_FLUENCY_SLIDER_CSS =
  "input[type=range].ux-dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none}" +
  "input[type=range].ux-dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)}" +
  "input[type=range].ux-dz-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer}";

var DOCTOR_DZ_SLIDER_CSS =
  "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none}\n" +
  "  input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)}\n" +
  "  input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed}\n" +
  "  input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2}\n" +
  "  input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";

var PROGRESSIVE_REVEAL_CSS =
  "@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .reveal{animation:fadeSlide 0.25s ease-out both;}";

function DZSliderStyles(props) {
  var variant = props.variant || "standard";
  var css =
    variant === "finance"
      ? DZ_SLIDER_CSS_FINANCE
      : variant === "localization"
        ? DZ_SLIDER_CSS_LOCALIZATION
        : DZ_SLIDER_CSS_STANDARD;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function ProgressiveRevealStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PROGRESSIVE_REVEAL_CSS }} />;
}

export {
  DZ_SLIDER_CSS_STANDARD,
  DZ_SLIDER_CSS_FINANCE,
  DZ_SLIDER_CSS_LOCALIZATION,
  UX_FLUENCY_SLIDER_CSS,
  DOCTOR_DZ_SLIDER_CSS,
  PROGRESSIVE_REVEAL_CSS,
  DZSliderStyles,
  ProgressiveRevealStyles,
};
