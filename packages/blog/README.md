# blog (Hexo/Qiita Project Source)

## Setup

### Configuration
Before deploying to Qiita, you need to set up the mapping configuration file:

```bash
# Copy the example configuration file
cp config/mapping.config.js.example config/mapping.config.js

# Edit the configuration file with your actual URLs and mappings
# config/mapping.config.js contains:
# - RULE_OF_REPLACER: URL/text replacement rules
# - QIITA_MAP: mapping between article filenames and replacement rules
```

## Deployed at
- cloudflare/workers  
[https://maekawa.dev/blog](https://maekawa.dev/blog)
- qiita  
[Qiita-@takaya_maekawa](https://qiita.com/takaya_maekawa).  
If you wanna deploy to Qiita, plz execute `npm run qiita:deploy` before git pushing.

## Scripts
- `npm run qiita:deploy`: Deploy changed markdown files to Qiita with URL mapping
- `node scripts/rep.js <directory> <filename|all>`: Apply URL mappings to specific files

## Static Site Generator
Powered by [hexojs/hexo](https://github.com/hexojs/hexo)

## License

This Hexo project contains content and assets under different licenses:

- **Content in `source/_posts`, `qiita/public`, `qiita/public/.remote` directories:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0) (see `source/_posts/LICENSE`).
- **Other files in this repository:** MIT License (see `LICENSE` in the root directory).
