$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$CanvasW = 1280
$CanvasH = 640
$bmp = New-Object System.Drawing.Bitmap($CanvasW, $CanvasH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'
$g.TextRenderingHint = 'ClearTypeGridFit'

# Palette (matches the app theme)
$bg        = [System.Drawing.Color]::FromArgb(255, 16, 18, 22)
$teal      = [System.Drawing.Color]::FromArgb(255, 102, 217, 199)
$gold      = [System.Drawing.Color]::FromArgb(255, 246, 197, 92)
$white     = [System.Drawing.Color]::FromArgb(255, 238, 242, 248)
$muted     = [System.Drawing.Color]::FromArgb(255, 158, 169, 186)
$panel     = [System.Drawing.Color]::FromArgb(40, 255, 255, 255)

# Background + soft corner glows
$g.Clear($bg)
$glow1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point(520,320)),
  ([System.Drawing.Color]::FromArgb(34,102,217,199)), $bg)
$g.FillRectangle($glow1, 0, 0, 520, 320)
$glow2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point($CanvasW,$CanvasH)), (New-Object System.Drawing.Point(($CanvasW-520),($CanvasH-320))),
  ([System.Drawing.Color]::FromArgb(28,246,197,92)), $bg)
$g.FillRectangle($glow2, ($CanvasW-520), ($CanvasH-320), 520, 320)

function Text($x,$y,$s,$font,$brush){
  $g.DrawString($s, $font, $brush, $x, $y)
}

# Fonts
$fEyebrow = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Bold)
$fTitle   = New-Object System.Drawing.Font('Segoe UI Semibold', 66, [System.Drawing.FontStyle]::Bold)
$fSub     = New-Object System.Drawing.Font('Segoe UI', 28, [System.Drawing.FontStyle]::Regular)
$fChip    = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Bold)
$fAuthor  = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Bold)

$bWhite = New-Object System.Drawing.SolidBrush($white)
$bTeal  = New-Object System.Drawing.SolidBrush($teal)
$bMuted = New-Object System.Drawing.SolidBrush($muted)

# Eyebrow
Text 90 96 'MEETING VISION STUDIO' $fEyebrow $bTeal

# Title (two lines, kept narrow so it never collides with the box motif)
Text 88 150 'Live CV' $fTitle $bWhite
Text 88 232 'control room' $fTitle $bWhite

# Subtitle
Text 92 336 'Playful, privacy-first computer vision for meetings.' $fSub $bMuted
Text 92 378 'Runs entirely in your browser.' $fSub $bMuted

# Detection-box motif (right side): bounding boxes with corner accents
function DetBox($x,$y,$w,$h,$color){
  $pen = New-Object System.Drawing.Pen($color, 4)
  $null = $g.DrawRectangle($pen, $x, $y, $w, $h)
  # corner accents
  $pen2 = New-Object System.Drawing.Pen($color, 7)
  $c = 22
  $null = $g.DrawLine($pen2, $x, $y, ($x+$c), $y)
  $null = $g.DrawLine($pen2, $x, $y, $x, ($y+$c))
  $null = $g.DrawLine($pen2, ($x+$w-$c), ($y+$h), ($x+$w), ($y+$h))
  $null = $g.DrawLine($pen2, ($x+$w), ($y+$h-$c), ($x+$w), ($y+$h))
  $pen.Dispose(); $pen2.Dispose()
}
DetBox 840 120 360 270 $teal
DetBox 890 175 150 130 $gold

# Tech chips
$chips = @('React','TypeScript','Vite','TensorFlow.js','COCO-SSD')
$cx = 92
$chipY = 470
foreach ($chip in $chips){
  $sz = [System.Windows.Forms.TextRenderer]::MeasureText($chip, $fChip)
  $w = $sz.Width + 36
  $rect = New-Object System.Drawing.Rectangle($cx, $chipY, $w, 48)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r = 24
  $path.AddArc($rect.X,$rect.Y,$r,$r,180,90)
  $path.AddArc(($rect.Right-$r),$rect.Y,$r,$r,270,90)
  $path.AddArc(($rect.Right-$r),($rect.Bottom-$r),$r,$r,0,90)
  $path.AddArc($rect.X,($rect.Bottom-$r),$r,$r,90,90)
  $path.CloseFigure()
  $fill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,26,30,38))
  $g.FillPath($fill, $path)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255,102,217,199), 2)
  $g.DrawPath($pen, $path)
  $bChip = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,236,255,251))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
  $chipFontSize = $fChip.Size
  $g.DrawString($chip, $fChip, $bChip, [float]($rect.X + $rect.Width/2), [float]($rect.Y + $rect.Height/2 - $chipFontSize/2), $sf)
  $cx += $w + 14
  $fill.Dispose(); $pen.Dispose(); $bChip.Dispose(); $sf.Dispose(); $path.Dispose()
}

# Author line
Text 92 560 '@admasfeleke' $fAuthor $bMuted

# Save
$out = Join-Path $PSScriptRoot 'social-preview.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
$f = Get-Item $out
"Saved: $($f.FullName) ($([math]::Round($f.Length/1KB,1)) KB, ${CanvasW}x${CanvasH})"
