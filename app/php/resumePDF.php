<?php
header('Content-type: application/pdf');
header('Content-disposition: attachment; filename=DavidHarvey.pdf');
readfile("../DavidHarveyCV.pdf");
?>