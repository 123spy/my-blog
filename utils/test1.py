import os
import shutil
import filecmp
import subprocess
import time
from datetime import datetime

# --- 默认配置区域 ---
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
        path = os.path.abspath(path.replace('"', ''))
        if os.path.exists(path) and os.path.isdir(path):
            return path
        print(f"❌ 路径错误：找不到文件夹 '{path}'")

def get_sync_list(source_dir, dest_dir):
    """预检：获取所有需要同步的文件列表"""
    pending_tasks = []
    
    for root, dirs, files in os.walk(source_dir):
        # 计算相对路径，以便在目标文件夹中定位
        rel_path = os.path.relpath(root, source_dir)
        target_root = os.path.join(dest_dir, rel_path)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in WHITE_LIST:
                src_file = os.path.join(root, file)
                dst_file = os.path.join(target_root, file)
                
                # 如果目标文件不存在，或者内容有差异，加入待办列表
                if not os.path.exists(dst_file) or not filecmp.cmp(src_file, dst_file, shallow=False):
                    pending_tasks.append((src_file, dst_file))
    
    return pending_tasks

def execute_git(git_dir):
    """执行 Git 自动化操作"""
    # 再次确认是否执行 Git
    confirm = input(f"\n❓ 是否执行 Git 脚本 (add/commit/push)? (y/n): ").strip().lower()
    if confirm != 'y':
        print("已跳过 Git 操作。")
        return

    try:
        os.chdir(git_dir)
        if not os.path.exists(".git"):
            print("⚠️ 提示：该路径不是 Git 仓库。")
            return

        # 获取当前时间作为提交信息
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = f"Auto-sync: {current_time}"

        print(f"🚀 正在推送，提交信息: {commit_msg}")
        subprocess.run(["git", "add", "."], check=True)
        # 如果没有文件变化，commit 会返回 1，这里设 check=False
        subprocess.run(["git", "commit", "-m", commit_msg], check=False)
        subprocess.run(["git", "push"], check=True)
        print("✅ Git 操作成功！")
    except Exception as e:
        print(f"❌ Git 失败: {e}")

if __name__ == "__main__":
    print("=== Markdown 自动同步工具 (增强确认版) ===\n")

    # 1. 交互获取路径
    src_dir = get_input_path("1. 请输入【源文件夹】", DEFAULT_SOURCE)
    dst_dir = get_input_path("2. 请输入【目标文件夹】", DEFAULT_DEST)
    git_dir = get_input_path("3. 请输入【Git执行】路径", DEFAULT_GIT)

    # 2. 预检并展示路径
    print("\n🔍 正在扫描差异...")
    tasks = get_sync_list(src_dir, dst_dir)

    if not tasks:
        print("✨ 所有文件已是最新，无需同步。")
    else:
        print(f"\n检测到以下 {len(tasks)} 个文件需要同步：")
        for s, d in tasks:
            print(f"  源: {s}")
            print(f"  ->: {d}\n")

        # 3. 询问是否同步
        confirm_sync = input(f"❓ 确认将以上文件同步至目标文件夹? (y/n): ").strip().lower()
        if confirm_sync == 'y':
            for s, d in tasks:
                os.makedirs(os.path.dirname(d), exist_ok=True)
                shutil.copy2(s, d)
            print("✅ 文件同步完成。")
            
            # 4. 执行 Git
            execute_git(git_dir)
        else:
            print("已取消同步。")

    print("\n任务结束。")
    input("按回车键退出...")