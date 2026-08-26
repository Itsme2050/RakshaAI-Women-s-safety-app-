const fs = require('fs');
const path = require('path');

function compilePreview() {
  console.log('[Compiler] Generating updated preview.html from source files...');
  
  try {
    const htmlPath = path.join(__dirname, 'index.html');
    const cssPath = path.join(__dirname, 'styles.css');
    const dataPath = path.join(__dirname, 'data.js');
    const i18nPath = path.join(__dirname, 'i18n.js');
    const appPath = path.join(__dirname, 'app.js');
    
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const i18nContent = fs.readFileSync(i18nPath, 'utf8');
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // Replace link stylesheet with inlined styles
    htmlContent = htmlContent.replace(
      '<link rel="stylesheet" href="styles.css" />',
      `<style>\n${cssContent}\n</style>`
    );
    
    // Replace script data.js with inlined scripts
    htmlContent = htmlContent.replace(
      '<script src="data.js"></script>',
      `<script>\n${dataContent}\n</script>`
    );
    
    // Replace script i18n.js with inlined scripts
    htmlContent = htmlContent.replace(
      '<script src="i18n.js"></script>',
      `<script>\n${i18nContent}\n</script>`
    );
    
    // Replace script app.js with inlined script
    htmlContent = htmlContent.replace(
      '<script src="app.js" type="text/babel"></script>',
      `<script type="text/babel">\n${appContent}\n</script>`
    );
    
    // Write out to preview.html
    const previewPath = path.join(__dirname, 'preview.html');
    fs.writeFileSync(previewPath, htmlContent, 'utf8');
    
    console.log('[Compiler] Successfully compiled preview.html! (Size:', fs.statSync(previewPath).size, 'bytes)');
  } catch (error) {
    console.error('[Compiler Error] Failed compiling preview.html:', error.message);
  }
}

// Run compilation
compilePreview();
