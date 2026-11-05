import { createServer } from 'vite';
import { ViteNodeServer } from 'vite-node/server';
import { ViteNodeRunner } from 'vite-node/client';
// Native config loading avoids esbuild scanning restricted parent directories on Windows.
const server=await createServer({configLoader:'native',server:{watch:null},logLevel:'error'});
try {
 await server.environments.client.pluginContainer.buildStart({});
 const node=new ViteNodeServer(server);
 const runner=new ViteNodeRunner({root:server.config.root,base:server.config.base,fetchModule:id=>node.fetchModule(id),resolveId:(id,importer)=>node.resolveId(id,importer)});
 await runner.executeFile('scripts/validate.ts');
}finally{await server.close();}
