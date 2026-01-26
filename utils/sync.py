import os
import shutil
import filecmp
import subprocess
import time
from datetime import datetime

# --- 默认配置区域 ---
DEFAULT_SOURCE = r'D:/知识'
DEFAULT_DEST   = r'D:/poroject/my-blog/docs/data'
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
        print(f"路径错误：找不到文件夹 '{path}'")

def check_sync_status(source_dir, dest_dir):
    """
    核心逻辑：双向比对
    1. 正向比对 (Source -> Dest): 找出需要 [新增/修改] 的文件
    2. 反向比对 (Dest -> Source): 找出需要 [删除] 的文件 (即目标有但源没有)
    """
    tasks_copy = []   # 待复制列表
    tasks_delete = [] # 待删除列表
    
    # 1. 正向扫描：源 -> 目标 (新增/更新)
    for root, dirs, files in os.walk(source_dir):
        rel_path = os.path.relpath(root, source_dir)
        target_root = os.path.join(dest_dir, rel_path)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in WHITE_LIST:
                src_file = os.path.join(root, file)
                dst_file = os.path.join(target_root, file)
                
                # 如果目标不存在，或者内容不同，标记为[复制]
                if not os.path.exists(dst_file) or not filecmp.cmp(src_file, dst_file, shallow=False):
                    tasks_copy.append((src_file, dst_file))

    # 2. 反向扫描：目标 -> 源 (删除多余文件)
    for root, dirs, files in os.walk(dest_dir):
        rel_path = os.path.relpath(root, dest_dir)
        source_root = os.path.join(source_dir, rel_path)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in WHITE_LIST: # 只处理白名单内的文件，避免误删 .git 或 config 文件
                dst_file = os.path.join(root, file)
                src_file = os.path.join(source_root, file)
                
                # 如果源文件夹里没有这个文件，标记为[删除]
                if not os.path.exists(src_file):
                    tasks_delete.append(dst_file)
    
    return tasks_copy, tasks_delete

def execute_git(git_dir):
    """执行 Git 自动化操作"""
    confirm = input(f"\n 是否执行 Git 脚本 (add/commit/push)? (y/n): ").strip().lower()
    if confirm != 'y':
        print("已跳过 Git 操作。")
        return

    try:
        os.chdir(git_dir)
        if not os.path.exists(".git"):
            print(" 提示：该路径不是 Git 仓库。")
            return

        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = f"Auto-sync: {current_time}"

        print(f" 正在推送，提交信息: {commit_msg}")
        subprocess.run(["git", "add", "."], check=True)
        # check=False 防止无变动时报错
        subprocess.run(["git", "commit", "-m", commit_msg], check=False)
        subprocess.run(["git", "push"], check=True)
        print(" Git 操作成功！")
    except Exception as e:
        print(f" Git 失败: {e}")

if __name__ == "__main__":
    print("=== 博客全量同步工具 v2.0 (镜像模式) ===\n")
    print("注意：镜像模式会【删除】目标文件夹中多余的文件，请谨慎操作！\n")

    # 1. 交互获取路径
    src_dir = get_input_path("1. 请输入[源文件夹]", DEFAULT_SOURCE)
    dst_dir = get_input_path("2. 请输入[目标文件夹]", DEFAULT_DEST)
    git_dir = get_input_path("3. 请输入[Git执行]路径", DEFAULT_GIT)

    # 2. 扫描差异
    print("\n 正在进行双向扫描...")
    to_copy, to_delete = check_sync_status(src_dir, dst_dir)

    if not to_copy and not to_delete:
        print(" 所有文件已完全一致，无需同步。")
    else:
        print("-" * 40)
        # 展示待复制
        if to_copy:
            print(f"检测到 {len(to_copy)} 个文件需要 [新增/修改] (+):")
            for s, d in to_copy:
                print(f"  [+] {os.path.basename(s)}")
        
        # 展示待删除
        if to_delete:
            print(f"\n检测到 {len(to_delete)} 个文件需要 [删除] (-):")
            for d in to_delete:
                print(f"  [-] {d}")
        print("-" * 40)

        # 3. 询问是否同步
        confirm_sync = input(f"\n 确认执行上述同步操作? (y/n): ").strip().lower()
        if confirm_sync == 'y':
            # 执行复制
            if to_copy:
                print("\n正在复制文件...")
                for s, d in to_copy:
                    os.makedirs(os.path.dirname(d), exist_ok=True)
                    shutil.copy2(s, d)
            
            # 执行删除
            if to_delete:
                print("\n正在清理多余文件...")
                for d in to_delete:
                    try:
                        os.remove(d)
                        print(f"已删除: {d}")
                    except Exception as e:
                        print(f"删除失败 {d}: {e}")

            print("\n 文件同步完成。")
            
            # 4. 执行 Git
            execute_git(git_dir)
        else:
            print("已取消同步。")

    print("\n任务结束。")
    input("按回车键退出...")