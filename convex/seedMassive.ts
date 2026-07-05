import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// ── Name pools ──────────────────────────────────────────────
const FIRST_MALE = ["James","John","Robert","Michael","David","William","Richard","Joseph","Thomas","Charles","Christopher","Daniel","Matthew","Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua","Kenneth","Kevin","Brian","George","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan","Jacob","Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin","Samuel","Raymond","Gregory","Frank","Alexander","Patrick","Jack","Dennis","Jerry","Tyler","Aaron","Jose","Nathan","Henry","Douglas","Peter","Adam","Zachary","Walter","Harold","Kyle","Carl","Arthur","Gerald","Roger","Lawrence","Albert","Jesse","Russell","Louis","Philip","Dylan","Wayne","Ralph","Eugene","Randy","Vincent","Bobby","Johnny","Harry","Isaiah","Elijah","Xavier","Marcus","Terrence","Darnell","Andre","Lamar","Tyrone","Cedric","DeAndre","Jamal","Malik","Dante","Omar","Rashad","Desmond","Reginald","Marquis","Jerome","Lorenzo","Vernon","Curtis","Clifford","Clarence","Wesley","Frederick","Leroy","Bernard","Milton","Roland","Ernest","Nathaniel","Alvin","Derek","Howard","Norman","Melvin","Harvey","Glenn","Marvin","Edgar","Grant","Victor","Felix","Mario","Hugo","Oscar","Salvador","Eduardo","Alejandro","Fernando","Ricardo","Sergio","Arturo","Ramon","Hector","Miguel","Joaquin","Rafael","Pablo","Lorenzo","Santiago","Mateo","Carlos","Diego","Felipe","Andres","Emilio","Julio","Marco","Pedro","Enrique"];
const FIRST_FEMALE = ["Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen","Lisa","Nancy","Betty","Margaret","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna","Michelle","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura","Cynthia","Kathleen","Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen","Samantha","Katherine","Christine","Debra","Rachel","Carolyn","Janet","Catherine","Maria","Heather","Diane","Ruth","Julie","Olivia","Joyce","Virginia","Victoria","Kelly","Lauren","Christina","Joan","Evelyn","Judith","Megan","Andrea","Cheryl","Hannah","Jacqueline","Martha","Gloria","Teresa","Ann","Sara","Madison","Frances","Kathryn","Janice","Jean","Abigail","Alice","Judy","Sophia","Grace","Denise","Tamika","Crystal","Latoya","Jasmine","Monique","Tanya","Ebony","Keisha","Rhonda","Vivian","Felicia","Tonya","Natasha","Yolanda","Sondra","April","Sheila","Vanessa","Adriana","Lucia","Rosa","Carmen","Isabel","Sofia","Valentina","Alejandra","Gabriela","Daniela","Catalina","Mariana","Liliana","Fernanda","Angelica","Marisol","Yesenia","Veronica","Lorena","Elena","Claudia","Estela","Miriam","Pilar","Rosario","Esperanza"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez","Powell","Jenkins","Perry","Russell","Sullivan","Bell","Coleman","Butler","Henderson","Barnes","Gonzales","Fisher","Vasquez","Simmons","Marks","Fox","Spencer","Dixon","Tucker","Hunt","Freeman","Stone","Palmer","Bishop","Wade","Douglas","Patterson","Grant","Wagner","McCoy","Mason","Kennedy","Wells","Carr","Armstrong"];
const BIOS = ["Choir member and worship leader","Sunday school teacher for 5+ years","Youth ministry volunteer","Usher team member","Tech team, live streaming","Prayer warrior and intercessor","Greeting ministry","Community outreach coordinator","Bible study facilitator","VBS director","Kitchen ministry volunteer","Parking lot ministry","Children's church helper","Audio/visual team","Dance ministry","Nursery volunteer","Men's fellowship leader","Women's group coordinator","College ministry advisor","Singles ministry","Marriage counseling volunteer","Mission trip coordinator","Food pantry manager","Hospital visitation team","Transportation ministry","Praise band musician","Social media ministry","Graphic design volunteer","Bookstore volunteer","New member orientation guide","Altar worker","Grief support facilitator","ESL teacher","Landscaping crew","Building maintenance","Security team","Financial committee","Drama ministry","Retreat planning committee","Sports ministry coach","Health and wellness ministry","Senior care visitation","Homeless shelter volunteer","Tutoring program coordinator","Jail ministry volunteer","Addiction recovery support","Special needs ministry","Sign language interpreter","Photography ministry","Administrative assistant"];
const INTERESTS = ["worship","prayer","bible study","community service","music","youth","children","missions","cooking","sports","gardening","reading","art","technology","fitness","counseling","teaching","writing","photography","meditation","fellowship","discipleship","evangelism","hospitality","mentoring"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const s = new Set<T>();
  while (s.size < n && s.size < arr.length) s.add(pick(arr));
  return [...s];
}
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── Batch 1: Members 1-500 ──────────────────────────────────
export const seedMassiveBatch1 = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const church = await ctx.db.query("churches").first();
    if (!church) throw new Error("No church");
    const existing = await ctx.db.query("members").withIndex("by_churchId", (q) => q.eq("churchId", church._id)).collect();
    if (existing.length >= 500) return null;
    const now = Date.now();
    const DAY = 86400000;
    const roles: Array<"member" | "visitor" | "leader"> = ["member","member","member","member","member","member","member","visitor","leader","member"];
    for (let i = 0; i < 500; i++) {
      const isMale = Math.random() > 0.5;
      const first = isMale ? pick(FIRST_MALE) : pick(FIRST_FEMALE);
      const last = pick(LAST);
      await ctx.db.insert("members", {
        userId,
        churchId: church._id,
        role: pick(roles),
        displayName: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@faithdemo.org`,
        phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
        bio: pick(BIOS),
        interests: pickN(INTERESTS, randInt(2, 5)),
        birthday: `${randInt(1960,2005)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
        isActive: Math.random() > 0.05,
        joinedAt: now - randInt(30, 1800) * DAY,
        lastActiveAt: now - randInt(0, 60) * DAY,
        isNewcomer: Math.random() < 0.08,
      });
    }
    return null;
  },
});

// ── Batch 2: Members 501-1000 ───────────────────────────────
export const seedMassiveBatch2 = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const church = await ctx.db.query("churches").first();
    if (!church) throw new Error("No church");
    const existing = await ctx.db.query("members").withIndex("by_churchId", (q) => q.eq("churchId", church._id)).collect();
    if (existing.length >= 1000) return null;
    const now = Date.now();
    const DAY = 86400000;
    const roles: Array<"member" | "visitor" | "leader"> = ["member","member","member","member","member","member","member","visitor","leader","member"];
    for (let i = 500; i < 1000; i++) {
      const isMale = Math.random() > 0.5;
      const first = isMale ? pick(FIRST_MALE) : pick(FIRST_FEMALE);
      const last = pick(LAST);
      await ctx.db.insert("members", {
        userId,
        churchId: church._id,
        role: pick(roles),
        displayName: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@faithdemo.org`,
        phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
        bio: pick(BIOS),
        interests: pickN(INTERESTS, randInt(2, 5)),
        birthday: `${randInt(1960,2005)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
        isActive: Math.random() > 0.05,
        joinedAt: now - randInt(30, 1800) * DAY,
        lastActiveAt: now - randInt(0, 60) * DAY,
        isNewcomer: Math.random() < 0.08,
      });
    }
    return null;
  },
});

// ── Batch 3: Members 1001-1500 ──────────────────────────────
export const seedMassiveBatch3 = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const church = await ctx.db.query("churches").first();
    if (!church) throw new Error("No church");
    const existing = await ctx.db.query("members").withIndex("by_churchId", (q) => q.eq("churchId", church._id)).collect();
    if (existing.length >= 1500) return null;
    const now = Date.now();
    const DAY = 86400000;
    const roles: Array<"member" | "visitor" | "leader"> = ["member","member","member","member","member","member","member","visitor","leader","member"];
    for (let i = 1000; i < 1500; i++) {
      const isMale = Math.random() > 0.5;
      const first = isMale ? pick(FIRST_MALE) : pick(FIRST_FEMALE);
      const last = pick(LAST);
      await ctx.db.insert("members", {
        userId,
        churchId: church._id,
        role: pick(roles),
        displayName: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@faithdemo.org`,
        phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
        bio: pick(BIOS),
        interests: pickN(INTERESTS, randInt(2, 5)),
        birthday: `${randInt(1960,2005)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
        isActive: Math.random() > 0.05,
        joinedAt: now - randInt(30, 1800) * DAY,
        lastActiveAt: now - randInt(0, 60) * DAY,
        isNewcomer: Math.random() < 0.08,
      });
    }
    return null;
  },
});
