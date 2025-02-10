module.exports.create = () => {
    const scene = new g.Scene({ game: g.game });
    scene.onLoad.add(() => {
        /////////////////
        ////放送主判定////
        /////////////////
        g.game.onJoin.add(ev => {
            broadcasterPlayerId = ev.player.id; // 放送者のプレイヤーID
            // 自分が放送者なら、「締め切る」ボタンを表示。
            if (g.game.selfId === broadcasterPlayerId) {
            settingObj.forEach(Obj => {Obj.touchable = true;});
            //参加処理
            resolvePlayerInfo.resolvePlayerInfo({ raises: true });
            sankaObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
            sankaObj.forEach(Obj => {Obj.modified();});
            }
            else{
            startObj.forEach(Obj => {Obj.hide(); Obj.touchable = false;});
            settingObj.forEach(Obj => {Obj.touchable = false;});
            }
            settingObj.forEach(Obj => {Obj.modified();});
            startObj.forEach(Obj => {Obj.modified();});
            settingstrs.forEach(Obj => {Obj.invalidate();});
        });

        ///////////////////////////////////////////
        ////操作キャラ表示優先度制御用オブジェクト////
        ///////////////////////////////////////////
        const players_back = new g.E({scene: scene, x: 0, y: 0, width: g.game.width, height: g.game.height, touchable: false, local: true});
        scene.append(players_back);

        const players_front = new g.E({scene: scene, x: 0, y: 0, width: g.game.width, height: g.game.height, touchable: false, local: true});
        scene.append(players_front);

        ///////////////////////////////////////
        ////操作キャラ生成・プレイヤー情報記録////
        ///////////////////////////////////////
        g.game.onPlayerInfo.add((ev) => {
        // リログ時にプレイヤーが多重生成されるので対応
        // PlayerIds内に入力されたプレイヤーIDが無い時のみ処理
        if (PlayerIds.indexOf(ev.player.id) == -1){
            // 各プレイヤーが名前利用許諾のダイアログに応答した時、通知されます。
            // ev.player.name にそのプレイヤーの名前が含まれます。
            // (ev.player.id には (最初から) プレイヤーIDが含まれています)

            const isLocalPlayer = ev.player.id === g.game.selfId;
            const Nushi_Then = ev.player.id === broadcasterPlayerId;
            const isHighPriority = isLocalPlayer || Nushi_Then;

            // プレイヤー画像
            const imageObj = scene.assets[isLocalPlayer ? "main_player" : Nushi_Then ? "host_player" : "npc_player"];

            PlayerIds.push(ev.player.id);
            let playerImage = new g.FrameSprite({scene: scene, src: imageObj,
            x: getrandom(22.5,1240,-1), y: 700, opacity: 1, local: true, hidden:true});
            (isHighPriority ? players_front : players_back).append(playerImage);
            playerImage.invalidate();

            let name = ev.player.name;
            // 名前はnullになることがあるので、その対策としてデフォルト値を設定
            if (name == null) {
            name = "██████████";
            }

            PlayerDatas[ev.player.id] = {
            Name:name,
            Main_Player:playerImage,
            moveX:0,
            moveY:0,
            imageD:0,
            state:"botti",
            sotuThen:false,
            destoroyed:false,
            images:imageObj
            };
            playercntLabel.text = String(PlayerIds.length) + "人",
            playercntLabel.invalidate();
            settingstrs.forEach(Obj => {Obj.invalidate();});
        }
        });

        ////////////////////////////
        ////プレイヤー人数カウント////
        ////////////////////////////
        let playercntBack = new g.FilledRect({scene: scene,x: g.game.width*0.73, y: g.game.height/5,
        width: 300, height: 300, cssColor: "gray", opacity: 0.5, parent:backlayer,touchable:false});
        scene.append(playercntBack);

        let playercntLabel = new g.Label({
        scene: scene, x: g.game.width*0.8, y: g.game.height/2.65, font: font, text: 1 + "人",
        fontSize: 75, textColor: "black", touchable: false,opacity: 1,local: false
        });
        scene.append(playercntLabel);

        let playercntHedder = new g.Label({
        scene: scene, x: g.game.width*0.77, y: g.game.height/4, font: font, text: "参加人数",
        fontSize: 50, textColor: "black", touchable: false,opacity: 1
        });
        scene.append(playercntHedder);

        playercntObj = [playercntBack,playercntHedder,playercntLabel]

    });
    return scene;
  };