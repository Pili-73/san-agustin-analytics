Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\scripts\capturas-fuente"
$outDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\public\tutorial"

$imgA = [System.Drawing.Image]::FromFile("$srcDir\paso4-desglose.png")
$imgB = [System.Drawing.Image]::FromFile("$srcDir\paso4-por-jugador.png")

$targetH = 480
function Resize-ToHeight($bmp, $h) {
  $w = [int]($bmp.Width * ($h / $bmp.Height))
  $out = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($bmp, 0, 0, $w, $h)
  $g.Dispose()
  return $out
}
$rA = Resize-ToHeight $imgA $targetH
$rB = Resize-ToHeight $imgB $targetH

$gap = 50
$pad = 30
$totalW = $pad*2 + $rA.Width + $gap + $rB.Width
$totalH = $pad*2 + $targetH

$canvas = New-Object System.Drawing.Bitmap($totalW, $totalH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bg = [System.Drawing.ColorTranslator]::FromHtml("#f8f2f0")
$g.Clear($bg)

$xA = $pad
$yA = $pad
$xB = $pad + $rA.Width + $gap
$yB = $pad

function Draw-Frame($g, $x, $y, $w, $h) {
  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40,0,0,0))
  $g.FillRectangle($shadowBrush, $x-6, $y-2, $w+12, $h+16)
}
Draw-Frame $g $xA $yA $rA.Width $rA.Height
Draw-Frame $g $xB $yB $rB.Width $rB.Height

$g.DrawImage($rA, $xA, $yA)
$g.DrawImage($rB, $xB, $yB)

$rojo = [System.Drawing.ColorTranslator]::FromHtml("#d8433e")

# Resalta la fila "Posicional" desplegada en el panel A (escalado desde 517x533 a rA).
$scaleA = $targetH / 533.0
$rectA_x = $xA + [int](10 * $scaleA)
$rectA_y = $yA + [int](28 * $scaleA)
$rectA_w = [int](445 * $scaleA)
$rectA_h = [int]((100-28) * $scaleA)
$penA = New-Object System.Drawing.Pen($rojo, 5)
$g.DrawRectangle($penA, $rectA_x, $rectA_y, $rectA_w, $rectA_h)

# Resalta la fila de selección de jugador en el panel B (escalado desde 893x715 a rB).
$scaleB = $targetH / 715.0
$rectB_x = $xB + [int](8 * $scaleB)
$rectB_y = $yB + [int](48 * $scaleB)
$rectB_w = [int](875 * $scaleB)
$rectB_h = [int]((92-48) * $scaleB)
$penB = New-Object System.Drawing.Pen($rojo, 5)
$g.DrawRectangle($penB, $rectB_x, $rectB_y, $rectB_w, $rectB_h)

$g.Dispose()
$outPath = "$outDir\paso4-montaje.png"
$canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "OK -> $outPath ($totalW x $totalH)"

$imgA.Dispose(); $imgB.Dispose(); $rA.Dispose(); $rB.Dispose(); $canvas.Dispose()
