<?php
$cwd = '/Users/corentinlepeltier/Desktop/Projet smart campus';
// Commit the changes to github
$cmd = 'cd "' . $cwd . '" && git add . && git commit -m "Nettoyage du code et ajout de la documentation (en-têtes de fichiers)" && git push origin main 2>&1';
$output = shell_exec($cmd);
echo "<pre>$output</pre>";
?>
