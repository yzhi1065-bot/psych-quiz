-- CreateTable
CREATE TABLE "sys_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "wxOpenId" TEXT,
    "wxUnionId" TEXT,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "totalAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "q_chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "q_chapter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "q_chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "q_question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" INTEGER NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "analysis" TEXT,
    "difficulty" INTEGER DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "q_question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "q_chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "q_option" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "q_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "q_question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_answer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sys_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "q_question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_mistake" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "lastWrongAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sys_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_mistake_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "q_question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_phone_key" ON "sys_user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_wxOpenId_key" ON "sys_user"("wxOpenId");

-- CreateIndex
CREATE INDEX "q_question_chapterId_idx" ON "q_question"("chapterId");

-- CreateIndex
CREATE INDEX "q_option_questionId_idx" ON "q_option"("questionId");

-- CreateIndex
CREATE INDEX "user_answer_userId_questionId_idx" ON "user_answer"("userId", "questionId");

-- CreateIndex
CREATE INDEX "user_answer_userId_createdAt_idx" ON "user_answer"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_mistake_userId_questionId_key" ON "user_mistake"("userId", "questionId");
