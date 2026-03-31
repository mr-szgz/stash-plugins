- use the new tools integration (See AIOverhaul plugin for example dashboard!) and create a LM Studio connection plugin
- this plugin is dependency of other plugins that want to use lmstudio models
- only supports lmstudio rest api - to keep things simple and it uses packages and client packages and official packages all entirely exhausted until even consider custom code
- error hanlding is forbidden, no legacy, no fallbacks, no error paths - these must all be avoided at all costs and removed aggressively.
- ability to put in the lm studio rest api url and port and optional token (use all default values for lmstudio thats what I use and almost everyone else as well). 

the Stash Tool under Stash > Settings > Tools > LM Studio Connection there is a primitive dashboard UI that can do this using existing patterns code and avoiding custom code as much as fucking posisble. you are NOT a design, not skilled devleoper but an idiot who does the basics for others to correct.

- model list and search
- current loaded model status
- select a model and populate codes with a copy icon in top right to copy as markdown all of the model and api calling details. like what lmstudio provides in-app but we'll put it here too to make it easy to get grounding context.
