Enable :
`gnome-shell-extension-tool -e 'Current_screen_only_for_Alternate_Tab@bourcereau.fr'`

Disable :
`gnome-shell-extension-tool -d 'Current_screen_only_for_Alternate_Tab@bourcereau.fr'`

Reload :
`gnome-shell-extension-tool -r Current_screen_only_for_Alternate_Tab@bourcereau.fr`

Look at errors with `journalctl /usr/bin/gnome-shell -fo cat | grep "Current_screen_only"`

Looking glass :
ALT-F2 lg -> extensions -> show errors

Reload gnome shell :
ALT-F2 r 
