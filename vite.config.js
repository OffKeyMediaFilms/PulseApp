import {defineConfig} from 'vite';
import {pulsePagesAssets} from './scripts/pages-assets.mjs';

export default defineConfig({
 // The original PULSE repository is separate; this build is for OffKeyMediaFilms/PulseApp only.
 base:'/PulseApp/',
 // Preserve existing editable public/videos and public/images configuration paths.
 publicDir:false,
 plugins:[pulsePagesAssets()],
 build:{outDir:'dist',emptyOutDir:true,sourcemap:false,assetsInlineLimit:0},
 server:{port:5173,strictPort:true},
 preview:{port:4173,strictPort:true}
});
