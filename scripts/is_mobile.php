<?php
include 'Mobile_Detect.php';

$detect = new Mobile_Detect();

$in = fopen('php://stdin', 'r');
while(!feof($in)){
    $line = substr(fgets($in, 4096), 0, -1);
    $type = '0';
    if (($detect->isMobile($line) && !$detect->isTablet($line))) {
      $type = '1';
    }
    print("\"$line\"," . $type . "\n");
}
?>
