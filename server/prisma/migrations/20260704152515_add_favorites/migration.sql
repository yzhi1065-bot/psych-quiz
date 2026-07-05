-- CreateTable
CREATE TABLE "user_favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sys_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_favorite_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "q_question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_userId_questionId_key" ON "user_favorite"("userId", "questionId");
