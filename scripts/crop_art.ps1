Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Users\Shuvankar\Downloads\Modern Login Screen UI_UX.jpg"
$dstPath = "D:\VoidCloude\public\login-art.jpg"

$src = [System.Drawing.Image]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

Write-Host "Source image size: $w x $h"

# The card in the screenshot starts around x=0.03*w, y=0.075*h, width=0.48*w, height=0.69*h
$cropX = [int]($w * 0.03)
$cropY = [int]($h * 0.076)
$cropW = [int]($w * 0.48)
$cropH = [int]($h * 0.694)

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
$src.Dispose()

Write-Host "Saved to $dstPath"
