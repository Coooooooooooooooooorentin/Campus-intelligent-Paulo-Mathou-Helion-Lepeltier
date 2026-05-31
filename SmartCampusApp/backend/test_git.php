<?php
$output = shell_exec('cd "/Users/corentinlepeltier/Desktop/Projet smart campus/SmartCampusApp" && git status 2>&1');
echo "<pre>$output</pre>";
?>
