# 🚀 Quick Reference - Face Shape Detector v2.0

## Running the App

```bash
# Standard way
./run.sh

# or
source venv/bin/activate && python face_shape_detector.py
```

## Using the Interface

1. **Start Face Scan** - Activates camera and detection
2. **Wait 1.5-2 seconds** - For temporal buffer to fill and stabilize
3. **Result appears** - In the right panel with confidence
4. **Stop Scan** - Stops camera when done

## Getting Accurate Results

### ✅ DO:
- **Use neutral expression** (no smiling, mouth closed)
- **Look directly at camera** (0° angle, front-facing)
- **Good lighting** (front or top light source)
- **Stay still** for at least 1.5 seconds
- **Position face centered** in the frame

### ❌ DON'T:
- Smile or make expressions (changes jaw measurements)
- Tilt head or look sideways
- Use in dark rooms
- Move around quickly
- Wear large hats or cover face

## Understanding Results

### Face Shapes:

**OVAL** 🥚
- Balanced proportions
- Face longer than wide (aspect 1.45-1.75)
- Gently rounded jawline
- Most common shape

**ROUND** ⭕
- Face length similar to width (aspect <1.25)
- Soft, curved features throughout
- Fuller cheeks
- Rounded chin

**SQUARE** ⬛
- Face length close to width (aspect 1.20-1.35)
- **Strong, angular jawline** (jaw angle 85-105°)
- Wide jaw (≥95% of cheekbone width)
- Minimal tapering

**HEART** 💜
- Wide forehead
- Narrowing to pointed chin
- Significant taper from top to bottom
- Sharp chin angle

**DIAMOND** 💎
- Widest at cheekbones
- Narrow forehead AND narrow jaw
- Cheekbones are the prominent feature
- High face aspect ratio

**UNCLEAR** ❓
- System is not confident enough to classify
- Features fall between multiple  categories
- Try better lighting or repositioning

## Troubleshooting

### "UNCLEAR" result:
- **Cause**: Mixed features, poor lighting, or expression
- **Fix**: Neutral expression, better light, hold steady for 2+ seconds

### Result keeps changing:
- **Cause**: Buffer not filled yet, or moving too much
- **Fix**: Wait full 2 seconds without moving

### Wrong classification:
- **Check**: Are you smiling? (changes jaw)
- **Check**: Head angle (should be 0°)
- **Check**: Lighting quality
- **Try**: Enable debug mode to see measurements

### Camera not working:
- **Run**: `python test_camera.py`
- **Fix**: May need to grant camera permissions or use different index

## Debug Mode (Advanced)

To see measurements and understand why you got a result:

1. Look at the colored lines on your face:
   - **Green**: Face height
   - **Blue**: Forehead width
   - **Red**: Cheekbone width
   - **Yellow**: Jaw width

2. Check the ratio values displayed on screen:
   - `face_aspect`: Higher = longer face
   - `jaw_ratio`: Higher = wider jaw (>0.95 = square)
   - `forehead_ratio`: Higher = wider forehead
   - `jaw_angle`: Lower = sharper angles (85-105° = square)
   - `chin_curvature`: Lower = pointed chin (<120° = heart)

## Validation Testing

To check system accuracy scientifically:

```bash
python test_validation.py
```

This will show:
- Live detection with metrics
- Stability percentage (should be ≥70%)
- FPS (should be ≥20)
- Shape distribution over time
- Final classification with confidence

Press 'q' to quit, 'd' to toggle debug overlay

## Common Confusions

### Square vs Oval:
- **Key difference**: Jaw angle
- Square: 85-105° (sharp corners)
- Oval: 100-130° (rounded corners)
- Also: Square has wider jaw (≥0.95 ratio)

### Round vs Oval:
- **Key difference**: Face aspect ratio
- Round: <1.25 (almost circular)
- Oval: 1.45-1.75 (vertical ellipse)

### Heart vs Diamond:
- **Key difference**: Forehead width
- Heart: Wide forehead (>1.05 ratio)
- Diamond: Narrow forehead (<0.92 ratio)

## Performance Notes

- **Initial detection**: Instant
- **Stable result**: 1.5-2 seconds
- **FPS**: 20-30 typical
- **Accuracy**: High with proper setup
- **Memory**: Low (60-frame buffer only)

## Files

- `face_shape_detector.py` - Main application
- `test_camera.py` - Camera diagnostic
- `test_validation.py` - Accuracy validation
- `SYSTEM_REDESIGN.md` - Technical documentation
- `REDESIGN_COMPLETE.md` - Summary & checklist
- `QUICKSTART.md` - Beginner guide

## Need Help?

1. Check known limitations in `REDESIGN_COMPLETE.md`
2. Run `test_camera.py` to verify camera
3. Run ` test_validation.py` to see live metrics
4. Enable debug mode to see measurements
5. Review `SYSTEM_REDESIGN.md` for technical details

---

**Version**: 2.0 (Complete Redesign)
**Status**: ✅ Production Ready
**Last Updated**: 2026-01-22
