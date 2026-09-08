Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\scripts\capturas-fuente"
$outDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\public\tutorial"

# --- Paso 1: crear equipo + añadir jugador ---
$imgEquipo = [System.Drawing.Image]::FromFile("$srcDir\paso1-crear-equipo.png")
$imgJugador = [System.Drawing.Image]::FromFile("$srcDir\paso1-anadir-jugador.png")

# Recorte aproximado del modal en cada captura (x, y, ancho, alto), con margen.
$cropEquipo = New-Object System.Drawing.Rectangle(440, 160, 410, 380)
$cropJugador = New-Object System.Drawing.Rectangle(180, 110, 410, 480)

function Crop-Image($img, $rect) {
  $bmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$rect.Width,$rect.Height)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $bmp
}

$c1 = Crop-Image $imgEquipo $cropEquipo
$c2 = Crop-Image $imgJugador $cropJugador

# Escala ambos recortes a la misma altura.
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
$r1 = Resize-ToHeight $c1 $targetH
$r2 = Resize-ToHeight $c2 $targetH

$gap = 90
$pad = 30
$totalW = $pad*2 + $r1.Width + $gap + $r2.Width
$totalH = $pad*2 + $targetH

$canvas = New-Object System.Drawing.Bitmap($totalW, $totalH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bg = [System.Drawing.ColorTranslator]::FromHtml("#f8f2f0")
$g.Clear($bg)

$x1 = $pad
$y1 = $pad
$x2 = $pad + $r1.Width + $gap
$y2 = $pad

# Sombra suave + marco blanco redondeado simulado con un rectángulo relleno detrás.
function Draw-Frame($g, $x, $y, $w, $h) {
  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40,0,0,0))
  $g.FillRectangle($shadowBrush, $x-6, $y-2, $w+12, $h+16)
}
Draw-Frame $g $x1 $y1 $r1.Width $r1.Height
Draw-Frame $g $x2 $y2 $r2.Width $r2.Height

$g.DrawImage($r1, $x1, $y1)
$g.DrawImage($r2, $x2, $y2)

# Flecha roja conectando los dos paneles.
$rojo = [System.Drawing.ColorTranslator]::FromHtml("#d8433e")
$pen = New-Object System.Drawing.Pen($rojo, 6)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowY = $pad + ($targetH / 2)
$arrowX1 = $x1 + $r1.Width + 14
$arrowX2 = $x2 - 14
$lineEndX = $arrowX2 - 18
$g.DrawLine($pen, $arrowX1, $arrowY, $lineEndX, $arrowY)
$brushRojo = New-Object System.Drawing.SolidBrush($rojo)
$tipX = $arrowX2
$baseX = $arrowX2 - 24
$topY = $arrowY - 14
$botY = $arrowY + 14
$p1 = New-Object System.Drawing.Point($tipX, $arrowY)
$p2 = New-Object System.Drawing.Point($baseX, $topY)
$p3 = New-Object System.Drawing.Point($baseX, $botY)
$tri = [System.Drawing.Point[]]@($p1, $p2, $p3)
$g.FillPolygon($brushRojo, $tri)

# Círculos resaltando los botones de acción de cada panel.
function Draw-Highlight($g, $cx, $cy, $rw, $rh) {
  $pen = New-Object System.Drawing.Pen($rojo, 5)
  $rect = New-Object System.Drawing.Rectangle(($cx-$rw), ($cy-$rh), ($rw*2), ($rh*2))
  $g.DrawEllipse($pen, $rect)
}
Draw-Highlight $g 417 428 85 34
Draw-Highlight $g 928 442 92 34

$g.Dispose()
$outPath = "$outDir\paso1-montaje.png"
$canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "OK -> $outPath ($totalW x $totalH)"

$imgEquipo.Dispose(); $imgJugador.Dispose(); $c1.Dispose(); $c2.Dispose(); $r1.Dispose(); $r2.Dispose(); $canvas.Dispose()
