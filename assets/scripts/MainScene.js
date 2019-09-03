// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 创建world
        let gravity = new cc.b2Vec2(0, -10);
        world = new cc.b2World(gravity);
        
        // 墙壁
        var bodyDef = new cc.b2BodyDef();
        var ground = world.CreateBody(bodyDef);

        var chainShape = new cc.b2ChainShape();
        chainShape.vertices.push(new cc.b2Vec2(0, -0.4));
        chainShape.vertices.push(new cc.b2Vec2(1, -0.4));
        chainShape.vertices.push(new cc.b2Vec2(1, 5));
        chainShape.vertices.push(new cc.b2Vec2(0, 5));

        chainShape.CreateLoop();
        ground.CreateFixtureFromShape(chainShape, 0);

        // 水粒子
        var shape = new cc.b2PolygonShape;
        shape.SetAsBoxXYCenterAngle(0.5, 0.5, new cc.b2Vec2(0.2, 4), 0);

        var psd = new cc.b2ParticleSystemDef();
        psd.radius = 0.05;
        psd.dampingStrength = 0.01;

        var particleSystem = world.CreateParticleSystem(psd);

        var pd = new cc.b2ParticleGroupDef();
        pd.shape = shape;
        var group = particleSystem.CreateParticleGroup(pd);
        
        let graphics = cc.find("Canvas/content").getComponent(cc.Graphics);
        graphics.clear();
        graphics.moveTo(200, 200);
        graphics.lineTo(600, 400);
        graphics.stroke();
        // 截图
        let renderTexture = cc.RenderTexture.create(graphics.node.width, graphics.node.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        
        let origPos = cc.v2(graphics.node.x, graphics.node.y);
        var worldPos = graphics.node.convertToWorldSpaceAR(cc.v2(0, 0));
        graphics.node.x = worldPos.x;
        graphics.node.y = worldPos.y;
        renderTexture.begin();
        graphics.node._sgNode.visit();
        renderTexture.end();
        graphics.node.x = origPos.x;
        graphics.node.y = origPos.y;
        graphics.node.active = false;
        
        let sprite = cc.find("Canvas/sprite").getComponent(cc.Sprite);
        sprite._spriteFrame = renderTexture.getSprite().getSpriteFrame();
        sprite._applySpriteFrame(null, true);
        
        let locTexture = sprite._spriteFrame._texture;
        locTexture.setAliasTexParameters(true);

        cc.find("Canvas/sprite").getComponent(require("./shader/EffectMetaBall")).activate(world.particleSystems[0]);
    },

    update (dt) {
        let timeStep = 1 / 60.0;
        let velocityIterations = 6;
        let positionIterations = 3;
        world.Step(timeStep, velocityIterations, positionIterations)
    },
});
