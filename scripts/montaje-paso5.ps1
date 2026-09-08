Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\scripts\capturas-fuente"
$outDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\public\tutorial"
$img = [System.Drawing.Image]::FromFile("$srcDir\paso5-configuracion.png")

$pad = 30
$totalW = $img.Width + $pad*2
$totalH = $img.Height + $pad*2

$canvas = New-Object System.Drawing.Bitmap($totalW, $totalH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bg = [System.Drawing.ColorTranslator]::FromHtml("#f8f2f0")
$g.Clear($bg)

$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40,0,0,0))
$g.FillRectangle($shadowBrush, $pad-6, $pad-2, $img.Width+12, $img.Height+16)
$destRect = New-Object System.Drawing.Rectangle($pad, $pad, $img.Width, $img.Height)
$srcRect = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)
$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$rojo = [System.Drawing.ColorTranslator]::FromHtml("#d8433e")
$pen = New-Object System.Drawing.Pen($rojo, 5)

# Columna Ataque y columna Defensa (coordenadas dentro de la imagen original 792x702).
$g.DrawRectangle($pen, ($pad+18), ($pad+158), 360, 432)
$g.DrawRectangle($pen, ($pad+393), ($pad+158), 360, 432)

$g.Dispose()
$outPath = "$outDir\paso5-montaje.png"
$canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "OK -> $outPath ($totalW x $totalH)"
$img.Dispose(); $canvas.Dispose()
