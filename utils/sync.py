import os
import shutil
import filecmp
import subprocess

# 打包命令
# pyinstaller --onefile --console sync.py


# --- 默认配置区域 ---
# 你可以在这里填入最常用的路径，运行后直接按回车即可
DEFAULT_SOURCE = r'D:/知识'
DEFAULT_DEST   = r'D:/poroject/my-blog/docs'
DEFAULT_GIT    = r'D:/poroject/my-blog'
# 白名单：只同步这些格式的文件
WHITE_LIST = {'.md', '.markdown', '.png', '.jpg', 'jpeg'}

def get_input_path(prompt, default):
    """交互获取路径并校验"""
    while True:
        user_input = input(f"{prompt} [默认: {default}]: ").strip()
        path = user_input if user_input else default
        path = os.path.abspath(path.replace('"', '')) # 去掉可能存在的引号
        
        if os.path.exists(path) and os.path.isdir(path):
            return path
        else:
            print(f"❌ 路径错误：找不到文件夹 '{path}'，请重新输入。")

def sync_logic(source_path, dest_path):
    """
    单向同步逻辑：
    只把 source 中的东西同步到 dest。
    如果 dest 中有 source 没有的文件，保持不动。
    """
    has_changed = False
    
    # 1. 如果是文件夹，递归处理
    if os.path.isdir(source_path):
        if not os.path.exists(dest_path):
            os.makedirs(dest_path)
        for item in os.listdir(source_path):
            if sync_logic(os.path.join(source_path, item), os.path.join(dest_path, item)):
                has_changed = True
    
    # 2. 如果是文件，检查白名单和差异
    else:
        ext = os.path.splitext(source_path)[1].lower()
        if ext in WHITE_LIST:
            # 只有当目标文件不存在，或者文件内容有差异时才拷贝
            if not os.path.exists(dest_path) or not filecmp.cmp(source_path, dest_path, shallow=False):
                shutil.copy2(source_path, dest_path)
                print(f"  [已同步] {os.path.basename(source_path)}")
                has_changed = True
                
    return has_changed

def execute_git(git_dir):
    """执行 Git 自动化操作"""
    try:
        os.chdir(git_dir)
        # 确认是否为 git 仓库
        if not os.path.exists(".git"):
            print("⚠️ 提示：选定路径不是 Git 仓库，跳过 Git 提交步骤。")
            return

        # 检查是否有文件变动
        status = subprocess.check_output(["git", "status", "--porcelain"]).strip()
        if not status:
            print("✨ 检查完毕：目标文件夹与本地仓库完全一致，无须提交。")
            return

        print("🚀 检测到变动，准备推送到远程仓库...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Auto-sync update"], check=False)
        subprocess.run(["git", "push"], check=True)
        print("✅ Git 推送成功！")
    except Exception as e:
        print(f"❌ Git 操作失败: {e}")

if __name__ == "__main__":
    print("Sync文件单向同步工具")

    # 1. 交互获取路径
    src_dir = get_input_path("1. 请输入【源文件夹】路径", DEFAULT_SOURCE)
    dst_dir = get_input_path("2. 请输入【目标文件夹】路径", DEFAULT_DEST)
    git_dir = get_input_path("3. 请输入【Git执行】路径", DEFAULT_GIT)

    print("\n--- 正在比对并同步 ---")
    
    # 2. 执行同步
    changed = False
    for item in os.listdir(src_dir):
        if sync_logic(os.path.join(src_dir, item), os.path.join(dst_dir, item)):
            changed = True

    # 3. Git 操作
    execute_git(git_dir)

    print("\n所有任务已完成！")
    input("按回车键退出程序...")