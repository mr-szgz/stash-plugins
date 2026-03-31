---
url: https://github.com/stashapp/stash/releases
title: Releases · stashapp/stash · GitHub
description: An organizer for your porn, written in Go.  Documentation:  https://docs.stashapp.cc - Releases · stashapp/stash
access_date: 2026-03-31T18:02:38.000Z
current_date: 2026-03-31T18:02:38.711Z
---

{{ message }}

 stashapp /   **stash** Public 

* Notifications
* Fork1k
* Star 12.1k

 31 Mar 07:32

![@github-actions](IMAGE) github-actions

 latest\_develop 

`0ed2992` 

Compare 

#  Choose a tag to compare

 View all tags

v0.31.0-2-g0ed2992a: Latest development build Pre-release 

Pre-release 

latest_develop

Fix typo in the manual (#6771)

 30 Mar 02:54

![@WithoutPants](IMAGE) WithoutPants

 v0.31.0 

`2da8074` 

Compare 

 View all tags

v0.31.0 Latest 

Latest 

# Release Notes

## v0.31.0 - 2026-03-30

### ✨ New Features

* Added support for image phash generation and filtering. (#6497)
* Added minimum/maximum number of sprites and sprite size options to support customised scene sprite generation. (#6588)
* Added support for merging performers. (#5910)
* Added `Reveal in file manager` button to file info panel when running locally. (#6587)
* Added `.stashignore` support for gitignore-style scan exclusions. (#6485)
* Added Selective generate option. (#6621)
* Added `From Clipboard` option to Set Image dropdown button (on secure connections). (#6637)
* Added Tags tagger view. (#6559, #6620)
* Added loop option for markers. (#6510)
* Added support for custom favicon and title. (#6366)
* Added Troubleshooting Mode to help identify and resolve common issues. (#6343)

### 🎨 Improvements

* Sidebars are now used for lists of galleries (#6157), images (#6607), groups (#6573), performers (#6547), studios (#6549), tags (#6610), and scene markers (#6603).
* Added folder sidebar criterion option for scenes, images and galleries. (#6636)
* Custom field support has been added to scenes (#6584), galleries (#6592), images (#6598), groups (#6596) studios (#6156) and tags (#6546).
* Bulk edit dialogs have been refactored to include more fields. (#6647)
* Extended duplicate criterion to filter by duplicated titles and stash IDs. (#6344)
* Extended missing criterion to add full coverage of fields. (#6565)
* Identify settings now allows for selecting included genders. (#6557)
* Added option to ignore files in zip files while cleaning. (#6700)
* Backup now provides an option to include blobs in a backup zip. (#6586)
* Added checkbox selection on wall and tagger views. (#6476)
* Performer career length field has been replaced with career start and end fields. (#6449)
* Added organised flag to studios. (#6303)
* Merging tags now shows a dialog to edit the merged tag's details. (#6552)
* New object pages now support for saving and creating another object. (#6438)
* Default performer images have been updated to be consistent with other card images. (#6566)
* Unsupported filter criteria are now indicated in the UI. (#6604)
* Marker screenshots can now be generated independently of marker previews. (#6433)
* Added invert selection option to list menus. (#6491)
* Added Generate task option for galleries. (#6442)
* Scene resolution and duration is now shown in the tagger view. (#6663)
* Added button to delete scene cover. (#6444)
* Duplicate aliases are now silently removed. (#6514)
* Image query now includes image details field. (#6673)
* Select scene/performer/studio/tag dropdowns now accept stash-ids as input. (#6709)
* Volume when hovering over a scene preview is now configurable. (#6712)
* Added non-binary gender icon. (#6489)
* Transgender icons are now coloured by their presented gender. (#6489)
* It is now possible to add a library path to a non-existing directory (useful for disconnected network paths). (#6644)
* Added activity tracking for DLNA resume/view counts. (#6407, #6483)
* SFW Mode now shows performer ages. (#6450)
* Added support for sorting scenes and images by resolution. (#6441)
* Added support for sorting performers and studios by latest scene. (#6501)
* Added support for sorting performers, studios and tags by total scene file size. (#6642)
* Added support for filtering by stash ID count. (#6437)
* Added support for filtering group by scene count. (#6593)
* Updated Tag list view to be consistent with other list views. (#6703)
* Added confirmation dialog to Auto Tag task. (#6735)
* Studio now shows the studio name instead of the studio image if the image is not set or if (new) `Show studio as text` is true. (#6716)
* Installed plugins/scrapers no longer show in the available list. (#6443)
* Name is now populated when searching by stash-box. (#6447)
* Improved performance of group queries on large systems. (#6478)
* Search input is now focused when opening the scraper menu. (#6704)
* Added `d d` keyboard shortcut to delete scene in scene details page. (#6755)
* VAAPI dri device can now be overridden using `STASH_HW_DRI_DEVICE` environment variable. (#6728)
* Added support for `{phash}` in `queryURL` scraper field. (#6701)
* Systray notification now shows the port stash is running on. (#6448)

### 🐛 Bug fixes

* Fixed certain unicode characters in library path causing panic in scan task. (#6431, #6589, #6635)
* Fixed bad network path error preventing rename detection during scanning. (#6680)
* Fixed duplicate files in zips being incorrectly reported as renames. (#6493)
* Fixed merging scene causing cover to be lost. (#6542)
* Improved scanning algorithm to prevent creation of orphaned folders and handle missing parent folders. (#6608)
* Scanning no longer scans zip contents when the zip file is unchanged. (#6633)
* Captions are now correctly detected in a single scan. (#6634)
* Fixed galleries not being linked to scenes when scanning a matching file. (#6705)
* Fixed mis-clicks on cards navigating to new page when selecting items. (#6599, #6649)
* Select dropdown now retains focus after creating a new option. (#6697)
* Fixed custom field filtering not working correctly when query value was provided. (#6614)
* Fixed `not equals` custom field filtering to include results where the field is not set. (#6742)
* Fixed `Scale up to fit` lightbox option not persisting correctly in some circumstances. (#6743)
* Fixed stale thumbnails after file content is changed. (#6622)
* Clicking on the scrubber in the scene player no longer pauses the video. (#6336)
* Tagger search results and states are now refreshed when changing the selected source in the tagger views. (#6766)
* Current selected source item...

 Read more

 👍7 

7 people reacted

 1 Join discussion 

 18 Dec 05:03

 v0.30.1 

`b23b026` 

Compare 

 View all tags

v0.30.1 

# Release Notes

## v0.30.1 - 2025-12-18

### 🐛 Bug fixes

* fixed hardware encode tests preventing desktop features from working correctly. (#6417)
* fixed Handy integration not functioning correctly. (#6425)
* fixed gallery create graphql interface not setting organised flag. (#6418)

 🎉3 ❤️2 🚀2 

3 people reacted

 16 Dec 23:56

 v0.30.0 

`857e673` 

Compare 

 View all tags

v0.30.0 

# Release Notes

## v0.30.0 - 2025-12-17

Based on user feedback, the scene list toolbar has been reverted to the old layout. This will be re-designed at a later date.

* Added SFW content mode option to settings and setup wizard. (#6262)
* Added stash-ids to Tags. (#6255)
* Added support for manually adding stash-ids to scenes, performers, studio and tags. (#6374)
* Added option to link a scraped tag to an existing tag in the tagger and scrape dialog. (#6389)
* Partial dates (year only or month/year) are now supported for all date fields. (#6359)
* Added support for specifying a trash location where deleted files will be moved instead of being permanently deleted. (#6237)
* Logs can now be compressed after reaching a configurable size. (#5696)
* Added ability to edit multiple studios at once. (#6238)
* Added ability to edit multiple scene markers at once. (#6239)
* Added support for multiple Studio URLs. (#6223)
* Added option to add markers to front page. (#6065)
* Added option for instant transitions in the image lightbox. (#6354)
* Added duration filter to scene list sidebar. (#6264)
* Added support for avif images. (#6288, #6337)
* Added experimental support for JPEG XL images. (#6184)

* Reverted scene toolbar to previous layout, consistent with other query pages. (#6322)
* Restored display mode button group to list pages. (#6317)
* Added sticky selection toolbar to all list views. (#6320)
* Added performer age slider to scene filter sidebar. (#6267)
* Added markers option to scene filter sidebar. (#6270)
* Selected stash-box is now remembered in the scene tagger view. (#6192)
* Replaced `Show male performers` tagger option with a list of genders to include. (#6321)
* Galleries can now be created using the gallery select control. (#6376)
* String list inputs can now be re-ordered. (#6397)
* Added auto-start button to scene player. (#6368)
* Bulk add tasks now accept stash ids in addition to names. (#6310)
* Image query metadata (total file size and megapixels) is now performed as a separate query to the main query to improve performance. (#6370)
* Removed some unused fields in the tag list query to improve performance. (#6398)
* Added hardware encoding support for Rockchip RKMPP devices. (#6182)
* stash now uses the Media Session API when playing scenes. (#6298)
* Screen sleeping is now prevented when playing scenes (only in secure contexts: `localhost` or https). (#6331)
* Whitespace is now trimmed from the start and end of text fields. (#6226)
* Added `inputURL` and `inputHostname` fields to scraper specs. (#6250)
* Added extra studio fields to scraper specs. (#6249)
* Added o-count to studio cards and details page. (#5982)
* Added o-count to group cards. (#6122)
* Added options to filter and sort groups by o-count. (#6122)
* Added o-count to performer details page. (#6171)
* Added option to sort by total scene direction for performers, studios and tags. (#6172)
* Added option to sort scenes by Performer age. (#6009)
* Added option to sort scenes by Studio. (#6155)
* Added option to show external links on Performer cards. (#6153)
* Improved dimension detection for webp files. (#6342)
* Added keyboard shortcuts to generate scene screenshot at current time (`c c`) and to regenerate default screenshot (`c d`). (#5984)
* Added keyboard shortcut for tagger view (`v t`). (#6261)
* Custom field values are now displayed truncated to 5 lines. (#6361)

### 🐛 Bug fixes

* stash-ids are now set when creating new objects from the scrape dialog. (#6269)
* partial dates are now correctly handled when scraping scenes. (#6305)
* Fixed zoom keyboard shortcuts not working. (#6317)
* Fixed inline videos showing as full-screen on iPhone devices. (#6259)
* Fixed external player not loading on Android when a scene title has special characters. (#6297)
* Play activity will now be recorded correctly when reaching the end of a video. (#6334)
* Fixed markers appearing in the wrong location when player is in fullscreen mode. (#6323)
* Fixed selected studio/performer being reset when saving a scene in the tagger view. (#6391, #6409)
* Fixed performer becoming unmatched when creating a new performer with the same name is created. (#6308)
* Fixed tagger options and buttons not being visible when there are no scenes in the result list. (#6316)
* Fixed error when scraping a studio if the alias field was empty. (#6313)
* Fixed existing match stash ID sometimes not being displayed in the performer scrape dialog. (#6257)
* Fixed download backup function not working when generated directory is on a different filesystem. (#6244)
* Fixed issue where duplicate file entries would be created if a file was modified and renamed with a different case on case-insensitive filesystems. (#6327)
* Hardware encoding tests are now performed concurrently at startup to reduce startup time. (#6414)
* Fixed scraper and plugin locations being converted to absolute paths during setup. (#6373)
* Fixed Macos version check pointing to incorrect location. (#6289)
* stash will no longer try to generate marker previews where a marker start is set after the end of a scene's duration. (#6290)
* Fixed panic when scraping a performer with no measurement value. (#6367)

### Api Changes

* added `remove` field to `CustomFieldsInput` to allow removing specific custom fields when updating objects. (#6362)

 👍2 🎉8 ❤️3 🚀3 

10 people reacted

 06 Nov 06:15

 v0.29.3 

`7716c4d` 

Compare 

 View all tags

v0.29.3 

# Release Notes

## v0.29.3 - 2025-11-06

### 🐛 Bug fixes

* Fixed sidebar filter contents not loading. (#6240)

 👍2 🎉1 ❤️1 🚀1 

2 people reacted

 06 Nov 00:46

 v0.29.2 

`beee37b` 

Compare 

 View all tags

v0.29.2 

# Release Notes

## v0.29.2 - 2025-11-06

The Scenes page and related scene list views design has been updated based on user feedback. Please provide any further feedback in the forum thread.

* **\[0.29.2\]** Returned saved filters button to the top toolbar in the Scene list. (#6215)
* **\[0.29.2\]** Top pagination can now be optionally shown in the scene list with custom css. (#6234)
* **\[0.29.2\]** Restyled the scene list toolbar based on user feedback. (#6215)
* **\[0.29.2\]** Sidebar section collapsed state is now saved in the browser history. (#6217)
* **\[0.29.2\]** Increased the number of pages in pagination dropdown to 1000\. (#6207)

### 🐛 Bug fixes

* **\[0.29.2\]** Fixed Play Random not playing from the current filtered scenes on scene list sub-pages. (#6202)
* **\[0.29.2\]** Fixed infinite loop in Group Sub-Groups panel. (#6212)
* **\[0.29.2\]** Page no longer scrolls when selecting criterion for the first time in the Edit Filter dialog. (#6205)
* **\[0.29.2\]** Zoom slider is no longer shown on mobile devices. (#6206)
* **\[0.29.2\]** Fixed trailing space sometimes being trimmed from query string when querying. (#6211)
* **\[0.29.2\]** Page now redirects to list page when deleting an object in a new browser tab. (#6203)
* **\[0.29.2\]** Related groups can now be scraped when scraping a scene. (#6228)
* **\[0.29.2\]** Fixed panic when a scraper configuration contains an unknown field. (#6220)
* **\[0.29.2\]** Fixed panic when using `stash_box_index` input in scrape API calls. (#6201)

 👍3 ❤️2 

4 people reacted

 0 Join discussion 

 22 Oct 02:08

 v0.29.1 

`869cbd4` 

Compare 

 View all tags

v0.29.1 

# Release Notes

## v0.29.1 - 2025-10-22

### 🐛 Bug fixes

* **\[0.29.1\]** Fixed password with special characters not allowing login. (#6163)
* **\[0.29.1\]** Fixed layout issues using column direction for image wall. (#6168)
* **\[0.29.1\]** Fixed layout issues for scene list table. (#6169)
* **\[0.29.1\]** Fixed UI loop when sorting by random without seed using URL. (#6167)

 🎉6 ❤️6 🚀4 

8 people reacted

 21 Oct 00:12

 v0.29.0 

`a6778d7` 

Compare 

 View all tags

v0.29.0 

The Scenes page and related scene list views have been updated with a filter sidebar and a toolbar for filtering and other actions. This design is intended to be applied to other query pages in the following release. The design will be refined based on user feedback.

You can help steer the direction of this design by providing feedback in the forum thread.

Old userscripts and plugins that intercept GraphQL with content-type `application/json` will stop working, as gqlenc uses the updated content-type `application/graphql-response+json`

* Redesigned the scenes page with filter sidebar. (#5714)
* Added Performers tab to Group details page. (#5895)
* Added configurable rate limit to stash-box connection options. (#5764)

* Revamped the scene and marker wall views. (#5816)
* Added zoom functionality to wall views. (#6011)
* Added search term field to the Edit Filter dialog. (#6082)
* Added load and save filter buttons to the Edit Filter dialog. (#6092)
* Restyled UI error messages. (#5813)
* Changed default modifier of `path` criterion to `includes` instead of `equals`. (#5968)
* Added internationalisation to login page. (#5765)
* Added Performer and Tag popovers to scene edit page. (#5739)
* Tags are now sorted by name in scrape and merge dialogs. (#5752)
* Related stash-box is now shown with IDs in tagger view. (#5879)
* UI now navigates to previous page when deleting an item. (#5818)
* All URLs will now be submitted when submitting a draft to stash-box. (#5894)
* Made funscript parsing more fault tolerant. (#5978)
* Added link to gallery in image lightbox. (#6012)
* Provide correct filename when downloading scene video. (#6119)
* Support hardware next/previous keys for scene navigation. (#5553)
* Duplicate checker now sorts largest file groups first. (#6133)
* Show gallery cover in Gallery edit panel. (#5935)
* Backups will now be created in the same directory as the database, then moved to the configured backup directory. This avoids potential corruption when backing up over a network share. (#6137)
* Added graphql playground link to tools panel. (#5807)
* Include IP address in login errors in log. (#5760)

### 🐛 Bug fixes

* Fixed ordering studios by tag count returning error. (#5776)
* Fixed error when submitting fingerprints for scenes that have been deleted. (#5799)
* Fixed errors when scraping groups. (#5793, #5974)
* Fixed UI crash when viewing a gallery in the Performer details page. (#5824)
* Fixed scraped performer stash ID being saved when cancelling scrape operation. (#5839)
* Fixed groups not transferring when merging tags. (#6127)
* Fixed URLs and stash IDs not transferring during scene merge operation. (#6151, #6152)
* Fixed empty exclusion patterns being applied when scanning and cleaning. (#6023)
* Fixed login page being included in browser history. (#5747)
* Fixed gallery card resizing while scrubbing. (#5844)
* Fixed incorrectly positioned scene markers in the scene player timeline. (#5801, #5804)
* Fixed incorrect marker colours in the scene player timeline. (#6141)
* Fixed custom fields not being displayed in Performer page with `Compact Expanded Details` enabled. (#5833)
* Fixed issue in tagger where creating a parent studio would not map it to the other results. (#5810, #5996)
* Fixed generation options not being respected when generating using the Tasks page. (#6139)
* Related tags are now ordered by name. (#5945)
* Fixed error message not being displayed when failing at startup. (#5798)
* Fixed incorrect paths in confirm step of the setup wizard. (#6138)
* Fixed values being lost when navigating back from the confirmation step of the setup wizard. (#6138)
* Fixed incorrect paths generated in HLS when using a reverse proxy prefix. (#5791)
* Fixed marker preview being deleted when modifying a marker with a duration. (#5800)
* Fixed marker end seconds not being included in import/export. (#5777)
* Fixed parent tags missing in export if including dependencies. (#5780)
* Add short hash of basename when generating export file names to prevent the same filename being generated. (#5780)
* Fixed invalid studio and performer links in the tagger view. (#5876)
* Fixed clickable area for tag links. (#6129)
* ffmpeg hardware encoding checks now timeout after 1 second to prevent startup hangs. (#6154)

 👍7 🎉9 ❤️11 🚀4 

19 people reacted

 3 Join discussion 

 19 Mar 23:08

 v0.28.1 

`cc6917f` 

Compare 

 View all tags

v0.28.1 

# Release Notes

## v0.28.1 - 2025-03-20

### 🐛 Bug fixes

* Fixed scene not playing from sub-second marker position when navigating from markers page. (#5744)
* Fixed URL not being excluded correctly in Studio tagger. (#5743)
* Fixed UI crash when loading saved filter with timestamp criteria. (#5742)

 👍11 🎉3 ❤️4 🚀2 

15 people reacted

 18 Mar 22:50

 v0.28.0 

`720bbcb` 

Compare 

 View all tags

v0.28.0 

# Release Notes

## v0.28.0 - 2025-03-19

* Markers now have an optional end time (#5311, #5633)
* Marker times now have sub-second precision (#5431)
* Added Grid view for Markers. (#5443)
* Scene markers can now be filtered and sorted by their duration. (#5472)
* Added custom fields for Performers. (#5487, #5632)
* Added Sort Name to Tags. (#5531)
* Added Image scraping. (#5562)
* It is now possible to configure an API key for a stash scraper source. (#5474)

* Changed modifier buttons to be selectable options in object filter selectors. (#5203)
* Changed Group Details images to be a flippable front/back rather than showing both at once. (#5367)
* Performer select now shows the performer age based on the date field. (#5110)
* Stash IDs now have an Updated At field. (#5259)
* Performer Death Date is now fetched from stash-box. (#5653)
* Batch Performer Update now handles Performers merged on stash-box. (#5664)
* ETA is now shown for tasks. (#5535)
* Scene Updated At field is now updated when Interactive Heatmap is generated. (#5401)
* Handy now resyncs automatically. (#5581)
* It is now possible to query by scene name in a stash scraper. (#5722)
* Added Scene Code sort by option. (#5708)

### 🐛 Bug fixes

* Fixed errors when scraping stash-box performers with null birthdates. (#5428)
* Fixed video files with identical phashes being merged during scan. (#5461)
* Fixed scraped tags showing the scraped tag name rather than the matched tag name. (#5462)
* Fixed unmatched scraped tags appearing in the Tag field when scraping groups. (#5522)
* Fixed issue where creating a new tag from the Tag selector would not update the tags field. (#5522)
* Invalid tagger blacklist entries now show an error message instead of crashing the UI. (#5497)
* Fixed Performer aliases not being excluded when updating from tagger. (#5566
* Fixed scene scrubber not working correctly in Tagger view. (#5507)
* Fixed Handy script not playing after revisiting scene. (#5578)
* Fixed various Handy playback issues. (#5576)
* Fixed incorrect image being shown in the lightbox when clicking on Group or Performer images in the applicable detail pages. (#5659)
* Saved Filters are now included in full export/import. (#5465)
* Fixed issue where entering text into the setup input fields would defocus the fields. (#5459)
* Fixed race condition when registering plugin custom routes. (#5523)
* Fixed scraping multiple URLs using the mapped scrapers. (#5677)
* Fixed excluded tags not being excluded when identifying scenes. (#5686)
* Fixed database locked error messages after migrating. (#5723)
* Fixed issue where scraped tags that resolve to the same tag would result in no scraped tags being shown. (#5733)
* Fixed Image Wall Margin setting not working correctly. (#5496)
* Fixed scraper errors when scraping from a stash instance. (#5474)
* Fixed duplicate Groups Scene filter criterion option. (#5504)
* Fixed back button returning to non-existing tag after merging. (#5712)

 👍5 🎉13 ❤️7
