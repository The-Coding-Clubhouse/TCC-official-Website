const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:4173';
const sandboxUrl = `${BASE_URL}/Sandbox/lego.html`;

const activities = [
  { id: 'stack', button: '#act-btn-stack', panel: '#panel-stack', mission: '🧱 Stack Builder — What Is Coding?' },
  { id: 'loop', button: '#act-btn-loop', panel: '#panel-stack', mission: '🔁 Loop Builder — Make repetition visible' },
  { id: 'ifthen', button: '#act-btn-ifthen', panel: '#panel-ifthen', mission: '🚦 If-Then Builder — Conditions & Rules' },
  { id: 'anim', button: '#act-btn-anim', panel: '#panel-anim', mission: '🎬 Story Animator — Events & Actions' },
  { id: 'fp', button: '#act-btn-fp', panel: '#panel-fp', mission: '🌟 Free Sandbox — Build Anything!' },
];

test.beforeEach(async ({ page }) => {
  await page.goto(sandboxUrl, { waitUntil: 'networkidle' });
});

test('activity switcher loads all days and shows the correct panel', async ({ page }) => {
  for (const activity of activities) {
    await page.click(activity.button);
    await expect(page.locator('#mission-label')).toHaveText(activity.mission);
    await expect(page.locator(activity.panel)).toHaveClass(/activity-panel.*active/);
    await expect(page.locator('#blocklyDiv')).toBeVisible();
  }
});

test('day 1 stack builder completes the first level with a valid stack', async ({ page }) => {
  await page.click('#act-btn-stack');
  const result = await page.evaluate(() => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="brick_yellow" x="20" y="20">
        <next>
          <block type="brick_blue">
            <next>
              <block type="brick_red"></block>
            </next>
          </block>
        </next>
      </block>
    </xml>`;
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    runCode();
    return completedLevels.has(currentLevel);
  });
  expect(result).toBe(true);
});

test('day 2 loop builder completes the first level with a repeat', async ({ page }) => {
  await page.click('#act-btn-loop');
  const result = await page.evaluate(() => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="repeat_block" x="20" y="20">
        <field name="TIMES">3</field>
        <statement name="DO">
          <block type="place_brick">
            <field name="COLOR">red</field>
            <next>
              <block type="place_brick">
                <field name="COLOR">blue</field>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`;
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), loopWorkspace);
    loopRun();
    return loopCompleted.has(currentLoopLevel);
  });
  expect(result).toBe(true);
});

test('day 3 if-then builder completes the first level after testing the red light', async ({ page }) => {
  await page.click('#act-btn-ifthen');
  const result = await page.evaluate(() => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="if_light_rule" x="20" y="20">
        <field name="COLOR">red</field>
        <field name="REACTION">STOP</field>
      </block>
    </xml>`;
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), ifWorkspace);
    runIfCode();
    testLight('red');
    return completedLevels.has(currentLevel);
  });
  expect(result).toBe(true);
});

test('day 4 animator completes the first level after programming LEFT and RIGHT', async ({ page }) => {
  await page.click('#act-btn-anim');
  const result = await page.evaluate(() => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="anim_when_key" x="20" y="20">
        <field name="KEY">LEFT</field>
        <statement name="DO">
          <block type="anim_move"><field name="ACTION">move_left</field></block>
        </statement>
        <next>
          <block type="anim_when_key">
            <field name="KEY">RIGHT</field>
            <statement name="DO">
              <block type="anim_move"><field name="ACTION">move_right</field></block>
            </statement>
          </block>
        </next>
      </block>
    </xml>`;
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), animWorkspace);
    runAnimCode();
    seOnKeyFired('LEFT');
    seOnKeyFired('RIGHT');
    return completedLevels.has(currentLevel);
  });
  expect(result).toBe(true);
});

test('day 5 free build loads and shows free sandbox mode', async ({ page }) => {
  await page.click('#act-btn-fp');
  await expect(page.locator('#mission-label')).toHaveText('🌟 Free Sandbox — Build Anything!');
  await expect(page.locator('#progress-text')).toHaveText('🌟 All unlocked');
});
