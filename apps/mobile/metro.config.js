const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

const resolveFromProject = (name) =>
  path.dirname(require.resolve(`${name}/package.json`, { paths: [projectRoot] }));

config.watchFolders = [workspaceRoot];

const aliases = {
  react: resolveFromProject("react"),
  "react-dom": resolveFromProject("react-dom"),
  "react-native": resolveFromProject("react-native"),
  "react-native-web": resolveFromProject("react-native-web"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasName = Object.keys(aliases).find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  );

  if (aliasName) {
    const target = path.join(aliases[aliasName], moduleName.slice(aliasName.length));
    return context.resolveRequest(context, target, platform);
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...aliases,
};

module.exports = config;
