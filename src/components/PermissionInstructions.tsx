export const renderPermissionInstructions = (permissionStatus: PermissionState) => {
    switch (permissionStatus) {
        case "denied":
            return (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <strong className="font-bold">
                        カメラへのアクセスが拒否されています。
                    </strong>
                    <p className="block sm:inline">
                        ブラウザの設定でカメラへのアクセスを許可してください。
                    </p>
                    <p>
                        設定方法:
                        <ol className="list-decimal list-inside">
                            <li>
                                ブラウザのアドレスバーの左側にあるカメラアイコンをクリック
                            </li>
                            <li>「常に許可」を選択</li>
                            <li>ページをリロード</li>
                        </ol>
                    </p>
                </div>
            );
        case "prompt":
            return (
                <p className="text-yellow-600">
                    アプリを開始すると、カメラへのアクセス許可を求められます。
                </p>
            );
        default:
            return null;
    }
};
