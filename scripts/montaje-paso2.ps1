Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\scripts\capturas-fuente"
$outDir = "C:\Users\Pilar\Documents\San_Agustin_Analytics\public\tutorial"
$img = [System.Drawing.Image]::FromFile("$srcDir\paso2-zonas.png")

# Recorte: fila Gol/Parada/Fuera + imagen de zonas (portería + lanzamiento).
$crop = New-Object System.Drawing.Rectangle(340, 83, 268, 312)
$cropped = New-Object System.Drawing.Bitmap($crop.Width, $crop.Height)
$gTmp = [System.Drawing.Graphics]::FromImage($cropped)
$gTmp.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$crop.Width,$crop.Height)), $crop, [System.Drawing.GraphicsUnit]::Pixel)
$gTmp.Dispose()

$pad = 30
$totalW = $cropped.Width + $pad*2
$totalH = $cropped.Height + $pad*2

$canvas = New-Object System.Drawing.Bitmap($totalW, $totalH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bg = [System.Drawing.ColorTranslator]::FromHtml("#f8f2f0")
$g.Clear($bg)

$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40,0,0,0))
$g.FillRectangle($shadowBrush, $pad-6, $pad-2, $cropped.Width+12, $cropped.Height+16)
$destRect = New-Object System.Drawing.Rectangle($pad, $pad, $cropped.Width, $cropped.Height)
$srcRect = New-Object System.Drawing.Rectangle(0, 0, $cropped.Width, $cropped.Height)
$g.DrawImage($cropped, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$rojo = [System.Drawing.ColorTranslator]::FromHtml("#d8433e")
$pen = New-Object System.Drawing.Pen($rojo, 5)

# Coordenadas relativas al recorte (crop empieza en x=340,y=83 de la original).
# Fila Gol/Parada/Fuera: original y 90-126 -> recorte y 7-43.
$g.DrawRectangle($pen, ($pad+3), ($pad+6), ($cropped.Width-6), 38)
# Imagen de zonas (portería + lanzamiento): original y 126-390 -> recorte y 43-307.
$g.DrawRectangle($pen, ($pad+3), ($pad+48), ($cropped.Width-6), ($cropped.Height-48-6))

$g.Dispose()
$outPath = "$outDir\paso2-montaje.png"
$canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "OK -> $outPath ($totalW x $totalH)"
$img.Dispose(); $cropped.Dispose(); $canvas.Dispose()
