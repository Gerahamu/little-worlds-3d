# Little Worlds 3D

用于制作可交互 Three.js 低多边形微缩场景的 Codex Skill。包含程序化建筑、人物、车辆、天气、昼夜切换和离线 HTML 导出。

## 安装

将本仓库克隆到 Codex 的 skills 目录：

```sh
git clone https://github.com/Gerahamu/little-worlds-3d.git ~/.codex/skills/little-worlds-3d
```

如果目标目录已经存在，请先备份，避免覆盖已有技能。

## 使用

在 Codex 中请求使用 `little-worlds-3d` 创建微缩城市、浮空街区或国家主题场景。

也可以直接初始化项目（需要 Python 3）：

```sh
python3 scripts/create-project.py --name my-world --destination /absolute/path/my-world
python3 /absolute/path/my-world/scripts/serve.py --port 8768
python3 /absolute/path/my-world/scripts/export-html.py
```

无需 npm 安装。完整工作流程见 [SKILL.md](SKILL.md)，架构和建模说明见 [references](references/)。

## 内容与来源

- `assets/starter/`：完整离线项目模板，包括 Three.js 0.180.0。
- `scripts/`：新项目初始化工具。
- `references/`：美术方向、架构、表面深度稳定性、湿路面反射及历史验证记录。
- `agents/`：Codex 技能界面配置。

第三方 Three.js 的 MIT 许可证保留于 `assets/starter/vendor/three/LICENSE`；依赖记录见 `assets/starter/vendor/DEPENDENCIES.json`。技能来源记录见 `references/provenance.json`。验证资料反映历史检查，不代表对所有新场景的保证。
