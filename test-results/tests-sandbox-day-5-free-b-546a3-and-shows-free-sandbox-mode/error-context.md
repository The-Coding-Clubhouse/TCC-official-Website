# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/sandbox.spec.js >> day 5 free build loads and shows free sandbox mode
- Location: tests/sandbox.spec.js:118:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#act-btn-fp')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "The Coding Clubhouse Logo" [ref=e3] [cursor=pointer]:
      - /url: ../index.html
      - img "The Coding Clubhouse Logo" [ref=e4]
    - generic [ref=e5]: Virtual Lego
    - generic [ref=e6]: 🧱 Stack Builder — What Is Coding?
    - generic [ref=e7]:
      - 'button "Day 1: Stack" [ref=e8] [cursor=pointer]'
      - 'button "Day 2: Loops" [ref=e9] [cursor=pointer]'
      - 'button "Day 3: If-Then" [ref=e10] [cursor=pointer]'
      - 'button "Day 4: Animator" [ref=e11] [cursor=pointer]'
      - 'button "Day 5: Free" [ref=e12] [cursor=pointer]'
  - generic [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]: 🔧 Your Code Workspace — drag blocks here to build your stack
      - generic [ref=e17]:
        - tree [ref=e19]:
          - treeitem "🧱 Bricks" [level=1] [ref=e20]:
            - generic [ref=e21]:
              - generic: 🧱 Bricks
        - img [ref=e22]:
          - generic "Blockly Workspace" [ref=e23]
        - img [ref=e28]
        - img [ref=e31]
        - img [ref=e34]
        - img [ref=e35]
        - img
        - img
    - generic [ref=e36]:
      - generic [ref=e37]:
        - generic [ref=e38]: "Level:"
        - button "1" [ref=e39] [cursor=pointer]
        - button "2" [ref=e40] [cursor=pointer]
        - button "3" [ref=e41] [cursor=pointer]
        - button "4" [ref=e42] [cursor=pointer]
      - generic [ref=e43]:
        - generic [ref=e44]: 🎯 Mission
        - generic [ref=e45]: "Build a tower: red on bottom → blue in middle → yellow on top. Order matters — just like instructions to a computer!"
      - generic [ref=e47]:
        - generic [ref=e48]: 🧱 Target stack → Your stack
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: YELLOW
              - generic [ref=e53]: BLUE
              - generic [ref=e54]: RED
            - generic [ref=e55]:
              - text: Target
              - text: (match this!)
          - generic [ref=e56]:
            - generic [ref=e58]: Drag bricks from the toolbox →
            - generic [ref=e59]:
              - text: Your
              - text: output
      - separator [ref=e60]
      - generic [ref=e61]:
        - button "▶ Run" [ref=e62] [cursor=pointer]
        - button "↺ Clear" [ref=e63] [cursor=pointer]
        - generic [ref=e64]:
          - text: "Blocks:"
          - generic [ref=e65]: "0"
      - generic [ref=e67]:
        - generic [ref=e68]: Levels complete
        - generic [ref=e69]: 0 / 4
```

# Test source

```ts
  19  |   for (const activity of activities) {
  20  |     await page.click(activity.button);
  21  |     await expect(page.locator('#mission-label')).toHaveText(activity.mission);
  22  |     await expect(page.locator(activity.panel)).toHaveClass(/activity-panel.*active/);
  23  |     await expect(page.locator('#blocklyDiv')).toBeVisible();
  24  |   }
  25  | });
  26  | 
  27  | test('day 1 stack builder completes the first level with a valid stack', async ({ page }) => {
  28  |   await page.click('#act-btn-stack');
  29  |   const result = await page.evaluate(() => {
  30  |     const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
  31  |       <block type="brick_yellow" x="20" y="20">
  32  |         <next>
  33  |           <block type="brick_blue">
  34  |             <next>
  35  |               <block type="brick_red"></block>
  36  |             </next>
  37  |           </block>
  38  |         </next>
  39  |       </block>
  40  |     </xml>`;
  41  |     Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
  42  |     runCode();
  43  |     return completedLevels.has(currentLevel);
  44  |   });
  45  |   expect(result).toBe(true);
  46  | });
  47  | 
  48  | test('day 2 loop builder completes the first level with a repeat', async ({ page }) => {
  49  |   await page.click('#act-btn-loop');
  50  |   const result = await page.evaluate(() => {
  51  |     const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
  52  |       <block type="repeat_block" x="20" y="20">
  53  |         <field name="TIMES">3</field>
  54  |         <statement name="DO">
  55  |           <block type="place_brick">
  56  |             <field name="COLOR">red</field>
  57  |             <next>
  58  |               <block type="place_brick">
  59  |                 <field name="COLOR">blue</field>
  60  |               </block>
  61  |             </next>
  62  |           </block>
  63  |         </statement>
  64  |       </block>
  65  |     </xml>`;
  66  |     Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), loopWorkspace);
  67  |     loopRun();
  68  |     return loopCompleted.has(currentLoopLevel);
  69  |   });
  70  |   expect(result).toBe(true);
  71  | });
  72  | 
  73  | test('day 3 if-then builder completes the first level after testing the red light', async ({ page }) => {
  74  |   await page.click('#act-btn-ifthen');
  75  |   const result = await page.evaluate(() => {
  76  |     const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
  77  |       <block type="if_light_rule" x="20" y="20">
  78  |         <field name="COLOR">red</field>
  79  |         <field name="REACTION">STOP</field>
  80  |       </block>
  81  |     </xml>`;
  82  |     Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), ifWorkspace);
  83  |     runIfCode();
  84  |     testLight('red');
  85  |     return completedLevels.has(currentLevel);
  86  |   });
  87  |   expect(result).toBe(true);
  88  | });
  89  | 
  90  | test('day 4 animator completes the first level after programming LEFT and RIGHT', async ({ page }) => {
  91  |   await page.click('#act-btn-anim');
  92  |   const result = await page.evaluate(() => {
  93  |     const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
  94  |       <block type="anim_when_key" x="20" y="20">
  95  |         <field name="KEY">LEFT</field>
  96  |         <statement name="DO">
  97  |           <block type="anim_move"><field name="ACTION">move_left</field></block>
  98  |         </statement>
  99  |         <next>
  100 |           <block type="anim_when_key">
  101 |             <field name="KEY">RIGHT</field>
  102 |             <statement name="DO">
  103 |               <block type="anim_move"><field name="ACTION">move_right</field></block>
  104 |             </statement>
  105 |           </block>
  106 |         </next>
  107 |       </block>
  108 |     </xml>`;
  109 |     Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), animWorkspace);
  110 |     runAnimCode();
  111 |     seOnKeyFired('LEFT');
  112 |     seOnKeyFired('RIGHT');
  113 |     return completedLevels.has(currentLevel);
  114 |   });
  115 |   expect(result).toBe(true);
  116 | });
  117 | 
  118 | test('day 5 free build loads and shows free sandbox mode', async ({ page }) => {
> 119 |   await page.click('#act-btn-fp');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  120 |   await expect(page.locator('#mission-label')).toHaveText('🌟 Free Sandbox — Build Anything!');
  121 |   await expect(page.locator('#progress-text')).toHaveText('🌟 All unlocked');
  122 | });
  123 | 
```