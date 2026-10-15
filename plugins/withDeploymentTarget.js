const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withDeploymentTarget = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

      const targetPatch = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      end
    end
`;

      if (!podfileContent.includes("config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'")) {
        if (podfileContent.includes('post_install do |installer|')) {
          podfileContent = podfileContent.replace(
            'post_install do |installer|',
            `post_install do |installer|${targetPatch}`
          );
        } else {
          podfileContent += `\npost_install do |installer|${targetPatch}\nend\n`;
        }
        fs.writeFileSync(podfilePath, podfileContent);
      }

      return config;
    },
  ]);
};

module.exports = withDeploymentTarget;