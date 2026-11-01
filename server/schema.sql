--
-- PostgreSQL database dump
--

\restrict SEefHLgnjbqMoJUoDeYGh3DHZAo8LKGqb4P45u2XiLMEP4CgskT9s5ISg8ArV9p

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Assignment" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "DueDate" timestamp with time zone,
    "TimeEstimate" numeric,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "ProjectId" uuid NOT NULL,
    "SprintId" uuid,
    "StatusId" uuid NOT NULL,
    "PriorityId" uuid,
    "ParentAssignmentId" uuid
);


ALTER TABLE public."Assignment" OWNER TO devuser;

--
-- Name: AssignmentAssignmentLabelMTMTable; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."AssignmentAssignmentLabelMTMTable" (
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "AssignmentId" uuid NOT NULL,
    "AssignmentLabelId" uuid NOT NULL
);


ALTER TABLE public."AssignmentAssignmentLabelMTMTable" OWNER TO devuser;

--
-- Name: AssignmentLabels; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."AssignmentLabels" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "HexColor" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "ProjectId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);


ALTER TABLE public."AssignmentLabels" OWNER TO devuser;

--
-- Name: AssignmentPriorities; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."AssignmentPriorities" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "HexColor" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "Order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."AssignmentPriorities" OWNER TO devuser;

--
-- Name: AssignmentStatuses; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."AssignmentStatuses" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "HexColor" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "Order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."AssignmentStatuses" OWNER TO devuser;

--
-- Name: AssignmentUserMTMTable; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."AssignmentUserMTMTable" (
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "AssignmentId" uuid NOT NULL,
    "UserId" uuid NOT NULL
);


ALTER TABLE public."AssignmentUserMTMTable" OWNER TO devuser;

--
-- Name: Companies; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Companies" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Nip" text,
    "Krs" text,
    "Regon" text,
    "Address" text,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Companies" OWNER TO devuser;

--
-- Name: CompanyNotes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."CompanyNotes" (
    "Id" uuid NOT NULL,
    "Content" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UserId" uuid NOT NULL,
    "CompanyId" uuid NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."CompanyNotes" OWNER TO devuser;

--
-- Name: ContactPeople; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."ContactPeople" (
    "Id" uuid NOT NULL,
    "CompanyId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "Email" text,
    "IsPrimary" boolean DEFAULT false NOT NULL,
    "Name" text,
    "Phone" text,
    "Role" text,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactPeople" OWNER TO devuser;

--
-- Name: CooperationLogs; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."CooperationLogs" (
    "Id" uuid NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "Title" text NOT NULL,
    "Description" text,
    "OldValue" text,
    "NewValue" text,
    "AuthorId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "CompanyId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."CooperationLogs" OWNER TO devuser;

--
-- Name: FileAccessMTMTable; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."FileAccessMTMTable" (
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "FileId" uuid NOT NULL,
    "UserId" uuid NOT NULL
);


ALTER TABLE public."FileAccessMTMTable" OWNER TO devuser;

--
-- Name: FileFileLabelMTMTable; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."FileFileLabelMTMTable" (
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "FileId" uuid NOT NULL,
    "FileLabelId" uuid NOT NULL
);


ALTER TABLE public."FileFileLabelMTMTable" OWNER TO devuser;

--
-- Name: FileLabels; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."FileLabels" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "HexColor" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone
);


ALTER TABLE public."FileLabels" OWNER TO devuser;

--
-- Name: Files; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Files" (
    "Id" uuid NOT NULL,
    "OldFileName" text NOT NULL,
    "FilePath" text NOT NULL,
    "IsPublic" boolean NOT NULL,
    "AuthorId" uuid NOT NULL,
    "AssignmentId" uuid,
    "ProjectId" uuid,
    "MessageId" uuid,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "Description" text DEFAULT ''::text
);


ALTER TABLE public."Files" OWNER TO devuser;

--
-- Name: Messages; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Messages" (
    "Id" uuid NOT NULL,
    "Text" text NOT NULL,
    "IsEdited" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "AuthorId" uuid NOT NULL,
    "AssignmentId" uuid NOT NULL,
    "ParentMessageId" uuid,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO devuser;

--
-- Name: NotificationTypes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."NotificationTypes" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "HexColor" text DEFAULT ''::text NOT NULL,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."NotificationTypes" OWNER TO devuser;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Notifications" (
    "Id" uuid NOT NULL,
    "Message" text NOT NULL,
    "IsRead" boolean NOT NULL,
    "AuthorId" uuid,
    "NotifiedId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "NotificationTypeId" uuid NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "ResourceId" uuid,
    "ResourceType" integer DEFAULT 0 NOT NULL,
    "SecondResourceId" uuid,
    "SecondResourceType" integer
);


ALTER TABLE public."Notifications" OWNER TO devuser;

--
-- Name: ProjectUserMTMTable; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."ProjectUserMTMTable" (
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "ProjectId" uuid NOT NULL,
    "UserId" uuid NOT NULL
);


ALTER TABLE public."ProjectUserMTMTable" OWNER TO devuser;

--
-- Name: Projects; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Projects" (
    "Id" uuid NOT NULL,
    "CompanyId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "Description" text DEFAULT ''::text,
    "ExpectedFinishDate" timestamp with time zone,
    "IsActive" boolean DEFAULT false NOT NULL,
    "IsSetToScrum" boolean DEFAULT false NOT NULL,
    "Name" text DEFAULT ''::text NOT NULL,
    "ProfilePictureUrl" text,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "StartDate" timestamp with time zone,
    "HexColor" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Projects" OWNER TO devuser;

--
-- Name: Raports; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Raports" (
    "Id" uuid NOT NULL,
    "AuthorId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "Name" text DEFAULT ''::text NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Raports" OWNER TO devuser;

--
-- Name: Reactions; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Reactions" (
    "Id" uuid NOT NULL,
    "Emoji" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "AuthorId" uuid NOT NULL,
    "CommentId" uuid NOT NULL,
    "UserId" uuid
);


ALTER TABLE public."Reactions" OWNER TO devuser;

--
-- Name: Sprints; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Sprints" (
    "Id" uuid NOT NULL,
    "Name" text,
    "StartDate" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "IsKanban" boolean NOT NULL,
    "ProjectId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Sprints" OWNER TO devuser;

--
-- Name: UserPermissionsTypes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."UserPermissionsTypes" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."UserPermissionsTypes" OWNER TO devuser;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."Users" (
    "Id" uuid NOT NULL,
    "Name" text DEFAULT ''::text NOT NULL,
    "ProfilePictureUrl" text,
    "UserPermissionsTypeId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "DeletedAt" timestamp with time zone,
    "IsDeleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Users" OWNER TO devuser;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO devuser;

--
-- Name: Assignment PK_Assignment; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "PK_Assignment" PRIMARY KEY ("Id");


--
-- Name: AssignmentAssignmentLabelMTMTable PK_AssignmentAssignmentLabelMTMTable; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentAssignmentLabelMTMTable"
    ADD CONSTRAINT "PK_AssignmentAssignmentLabelMTMTable" PRIMARY KEY ("Id");


--
-- Name: AssignmentLabels PK_AssignmentLabels; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentLabels"
    ADD CONSTRAINT "PK_AssignmentLabels" PRIMARY KEY ("Id");


--
-- Name: AssignmentPriorities PK_AssignmentPriorities; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentPriorities"
    ADD CONSTRAINT "PK_AssignmentPriorities" PRIMARY KEY ("Id");


--
-- Name: AssignmentStatuses PK_AssignmentStatuses; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentStatuses"
    ADD CONSTRAINT "PK_AssignmentStatuses" PRIMARY KEY ("Id");


--
-- Name: AssignmentUserMTMTable PK_AssignmentUserMTMTable; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentUserMTMTable"
    ADD CONSTRAINT "PK_AssignmentUserMTMTable" PRIMARY KEY ("Id");


--
-- Name: Companies PK_Companies; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "PK_Companies" PRIMARY KEY ("Id");


--
-- Name: CompanyNotes PK_CompanyNotes; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CompanyNotes"
    ADD CONSTRAINT "PK_CompanyNotes" PRIMARY KEY ("Id");


--
-- Name: ContactPeople PK_ContactPeople; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."ContactPeople"
    ADD CONSTRAINT "PK_ContactPeople" PRIMARY KEY ("Id");


--
-- Name: CooperationLogs PK_CooperationLogs; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CooperationLogs"
    ADD CONSTRAINT "PK_CooperationLogs" PRIMARY KEY ("Id");


--
-- Name: FileAccessMTMTable PK_FileAccessMTMTable; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileAccessMTMTable"
    ADD CONSTRAINT "PK_FileAccessMTMTable" PRIMARY KEY ("Id");


--
-- Name: FileFileLabelMTMTable PK_FileFileLabelMTMTable; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileFileLabelMTMTable"
    ADD CONSTRAINT "PK_FileFileLabelMTMTable" PRIMARY KEY ("Id");


--
-- Name: FileLabels PK_FileLabels; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileLabels"
    ADD CONSTRAINT "PK_FileLabels" PRIMARY KEY ("Id");


--
-- Name: Files PK_Files; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "PK_Files" PRIMARY KEY ("Id");


--
-- Name: Messages PK_Messages; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "PK_Messages" PRIMARY KEY ("Id");


--
-- Name: NotificationTypes PK_NotificationTypes; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."NotificationTypes"
    ADD CONSTRAINT "PK_NotificationTypes" PRIMARY KEY ("Id");


--
-- Name: Notifications PK_Notifications; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id");


--
-- Name: ProjectUserMTMTable PK_ProjectUserMTMTable; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."ProjectUserMTMTable"
    ADD CONSTRAINT "PK_ProjectUserMTMTable" PRIMARY KEY ("Id");


--
-- Name: Projects PK_Projects; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "PK_Projects" PRIMARY KEY ("Id");


--
-- Name: Raports PK_Raports; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Raports"
    ADD CONSTRAINT "PK_Raports" PRIMARY KEY ("Id");


--
-- Name: Reactions PK_Reactions; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Reactions"
    ADD CONSTRAINT "PK_Reactions" PRIMARY KEY ("Id");


--
-- Name: Sprints PK_Sprints; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Sprints"
    ADD CONSTRAINT "PK_Sprints" PRIMARY KEY ("Id");


--
-- Name: UserPermissionsTypes PK_UserPermissionsTypes; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."UserPermissionsTypes"
    ADD CONSTRAINT "PK_UserPermissionsTypes" PRIMARY KEY ("Id");


--
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~; Type: INDEX; Schema: public; Owner: devuser
--

CREATE UNIQUE INDEX "IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~" ON public."AssignmentAssignmentLabelMTMTable" USING btree ("AssignmentId", "AssignmentLabelId") WHERE ("IsDeleted" = false);


--
-- Name: IX_AssignmentAssignmentLabelMTMTable_AssignmentLabelId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_AssignmentAssignmentLabelMTMTable_AssignmentLabelId" ON public."AssignmentAssignmentLabelMTMTable" USING btree ("AssignmentLabelId");


--
-- Name: IX_AssignmentLabels_ProjectId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_AssignmentLabels_ProjectId" ON public."AssignmentLabels" USING btree ("ProjectId");


--
-- Name: IX_AssignmentUserMTMTable_AssignmentId_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE UNIQUE INDEX "IX_AssignmentUserMTMTable_AssignmentId_UserId" ON public."AssignmentUserMTMTable" USING btree ("AssignmentId", "UserId") WHERE ("IsDeleted" = false);


--
-- Name: IX_AssignmentUserMTMTable_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_AssignmentUserMTMTable_UserId" ON public."AssignmentUserMTMTable" USING btree ("UserId");


--
-- Name: IX_Assignment_DueDate; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_DueDate" ON public."Assignment" USING btree ("DueDate");


--
-- Name: IX_Assignment_ParentAssignmentId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_ParentAssignmentId" ON public."Assignment" USING btree ("ParentAssignmentId");


--
-- Name: IX_Assignment_PriorityId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_PriorityId" ON public."Assignment" USING btree ("PriorityId");


--
-- Name: IX_Assignment_ProjectId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_ProjectId" ON public."Assignment" USING btree ("ProjectId");


--
-- Name: IX_Assignment_SprintId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_SprintId" ON public."Assignment" USING btree ("SprintId");


--
-- Name: IX_Assignment_StatusId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Assignment_StatusId" ON public."Assignment" USING btree ("StatusId");


--
-- Name: IX_CompanyNotes_CompanyId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_CompanyNotes_CompanyId" ON public."CompanyNotes" USING btree ("CompanyId");


--
-- Name: IX_CompanyNotes_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_CompanyNotes_UserId" ON public."CompanyNotes" USING btree ("UserId");


--
-- Name: IX_ContactPeople_CompanyId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_ContactPeople_CompanyId" ON public."ContactPeople" USING btree ("CompanyId");


--
-- Name: IX_CooperationLogs_AuthorId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_CooperationLogs_AuthorId" ON public."CooperationLogs" USING btree ("AuthorId");


--
-- Name: IX_CooperationLogs_CompanyId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_CooperationLogs_CompanyId" ON public."CooperationLogs" USING btree ("CompanyId");


--
-- Name: IX_FileAccessMTMTable_FileId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_FileAccessMTMTable_FileId" ON public."FileAccessMTMTable" USING btree ("FileId");


--
-- Name: IX_FileAccessMTMTable_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_FileAccessMTMTable_UserId" ON public."FileAccessMTMTable" USING btree ("UserId");


--
-- Name: IX_FileFileLabelMTMTable_FileId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_FileFileLabelMTMTable_FileId" ON public."FileFileLabelMTMTable" USING btree ("FileId");


--
-- Name: IX_FileFileLabelMTMTable_FileLabelId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_FileFileLabelMTMTable_FileLabelId" ON public."FileFileLabelMTMTable" USING btree ("FileLabelId");


--
-- Name: IX_Files_AssignmentId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Files_AssignmentId" ON public."Files" USING btree ("AssignmentId");


--
-- Name: IX_Files_AuthorId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Files_AuthorId" ON public."Files" USING btree ("AuthorId");


--
-- Name: IX_Files_MessageId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Files_MessageId" ON public."Files" USING btree ("MessageId");


--
-- Name: IX_Files_ProjectId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Files_ProjectId" ON public."Files" USING btree ("ProjectId");


--
-- Name: IX_Messages_AssignmentId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Messages_AssignmentId" ON public."Messages" USING btree ("AssignmentId");


--
-- Name: IX_Messages_AuthorId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Messages_AuthorId" ON public."Messages" USING btree ("AuthorId");


--
-- Name: IX_Messages_ParentMessageId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Messages_ParentMessageId" ON public."Messages" USING btree ("ParentMessageId");


--
-- Name: IX_Notifications_AuthorId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Notifications_AuthorId" ON public."Notifications" USING btree ("AuthorId");


--
-- Name: IX_Notifications_NotificationTypeId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Notifications_NotificationTypeId" ON public."Notifications" USING btree ("NotificationTypeId");


--
-- Name: IX_Notifications_NotifiedId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Notifications_NotifiedId" ON public."Notifications" USING btree ("NotifiedId");


--
-- Name: IX_ProjectUserMTMTable_ProjectId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_ProjectUserMTMTable_ProjectId" ON public."ProjectUserMTMTable" USING btree ("ProjectId");


--
-- Name: IX_ProjectUserMTMTable_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_ProjectUserMTMTable_UserId" ON public."ProjectUserMTMTable" USING btree ("UserId");


--
-- Name: IX_Projects_CompanyId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Projects_CompanyId" ON public."Projects" USING btree ("CompanyId");


--
-- Name: IX_Raports_AuthorId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Raports_AuthorId" ON public."Raports" USING btree ("AuthorId");


--
-- Name: IX_Reactions_UserId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Reactions_UserId" ON public."Reactions" USING btree ("UserId");


--
-- Name: IX_Sprints_ProjectId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Sprints_ProjectId" ON public."Sprints" USING btree ("ProjectId");


--
-- Name: IX_Users_UserPermissionsTypeId; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX "IX_Users_UserPermissionsTypeId" ON public."Users" USING btree ("UserPermissionsTypeId");


--
-- Name: AssignmentAssignmentLabelMTMTable FK_AssignmentAssignmentLabelMTMTable_AssignmentLabels_Assignme~; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentAssignmentLabelMTMTable"
    ADD CONSTRAINT "FK_AssignmentAssignmentLabelMTMTable_AssignmentLabels_Assignme~" FOREIGN KEY ("AssignmentLabelId") REFERENCES public."AssignmentLabels"("Id") ON DELETE CASCADE;


--
-- Name: AssignmentAssignmentLabelMTMTable FK_AssignmentAssignmentLabelMTMTable_Assignment_AssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentAssignmentLabelMTMTable"
    ADD CONSTRAINT "FK_AssignmentAssignmentLabelMTMTable_Assignment_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES public."Assignment"("Id") ON DELETE CASCADE;


--
-- Name: AssignmentLabels FK_AssignmentLabels_Projects_ProjectId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentLabels"
    ADD CONSTRAINT "FK_AssignmentLabels_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"("Id") ON DELETE CASCADE;


--
-- Name: AssignmentUserMTMTable FK_AssignmentUserMTMTable_Assignment_AssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentUserMTMTable"
    ADD CONSTRAINT "FK_AssignmentUserMTMTable_Assignment_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES public."Assignment"("Id") ON DELETE CASCADE;


--
-- Name: AssignmentUserMTMTable FK_AssignmentUserMTMTable_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."AssignmentUserMTMTable"
    ADD CONSTRAINT "FK_AssignmentUserMTMTable_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: Assignment FK_Assignment_AssignmentPriorities_PriorityId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "FK_Assignment_AssignmentPriorities_PriorityId" FOREIGN KEY ("PriorityId") REFERENCES public."AssignmentPriorities"("Id");


--
-- Name: Assignment FK_Assignment_AssignmentStatuses_StatusId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "FK_Assignment_AssignmentStatuses_StatusId" FOREIGN KEY ("StatusId") REFERENCES public."AssignmentStatuses"("Id") ON DELETE CASCADE;


--
-- Name: Assignment FK_Assignment_Assignment_ParentAssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "FK_Assignment_Assignment_ParentAssignmentId" FOREIGN KEY ("ParentAssignmentId") REFERENCES public."Assignment"("Id") ON DELETE RESTRICT;


--
-- Name: Assignment FK_Assignment_Projects_ProjectId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "FK_Assignment_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"("Id") ON DELETE CASCADE;


--
-- Name: Assignment FK_Assignment_Sprints_SprintId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "FK_Assignment_Sprints_SprintId" FOREIGN KEY ("SprintId") REFERENCES public."Sprints"("Id");


--
-- Name: CompanyNotes FK_CompanyNotes_Companies_CompanyId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CompanyNotes"
    ADD CONSTRAINT "FK_CompanyNotes_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES public."Companies"("Id") ON DELETE CASCADE;


--
-- Name: CompanyNotes FK_CompanyNotes_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CompanyNotes"
    ADD CONSTRAINT "FK_CompanyNotes_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: ContactPeople FK_ContactPeople_Companies_CompanyId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."ContactPeople"
    ADD CONSTRAINT "FK_ContactPeople_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES public."Companies"("Id") ON DELETE CASCADE;


--
-- Name: CooperationLogs FK_CooperationLogs_Companies_CompanyId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CooperationLogs"
    ADD CONSTRAINT "FK_CooperationLogs_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES public."Companies"("Id") ON DELETE CASCADE;


--
-- Name: CooperationLogs FK_CooperationLogs_Users_AuthorId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."CooperationLogs"
    ADD CONSTRAINT "FK_CooperationLogs_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: FileAccessMTMTable FK_FileAccessMTMTable_Files_FileId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileAccessMTMTable"
    ADD CONSTRAINT "FK_FileAccessMTMTable_Files_FileId" FOREIGN KEY ("FileId") REFERENCES public."Files"("Id") ON DELETE CASCADE;


--
-- Name: FileAccessMTMTable FK_FileAccessMTMTable_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileAccessMTMTable"
    ADD CONSTRAINT "FK_FileAccessMTMTable_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: FileFileLabelMTMTable FK_FileFileLabelMTMTable_FileLabels_FileLabelId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileFileLabelMTMTable"
    ADD CONSTRAINT "FK_FileFileLabelMTMTable_FileLabels_FileLabelId" FOREIGN KEY ("FileLabelId") REFERENCES public."FileLabels"("Id") ON DELETE CASCADE;


--
-- Name: FileFileLabelMTMTable FK_FileFileLabelMTMTable_Files_FileId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."FileFileLabelMTMTable"
    ADD CONSTRAINT "FK_FileFileLabelMTMTable_Files_FileId" FOREIGN KEY ("FileId") REFERENCES public."Files"("Id") ON DELETE CASCADE;


--
-- Name: Files FK_Files_Assignment_AssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "FK_Files_Assignment_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES public."Assignment"("Id");


--
-- Name: Files FK_Files_Messages_MessageId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "FK_Files_Messages_MessageId" FOREIGN KEY ("MessageId") REFERENCES public."Messages"("Id");


--
-- Name: Files FK_Files_Projects_ProjectId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "FK_Files_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"("Id");


--
-- Name: Files FK_Files_Users_AuthorId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "FK_Files_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Messages FK_Messages_Assignment_AssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Assignment_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES public."Assignment"("Id") ON DELETE CASCADE;


--
-- Name: Messages FK_Messages_Messages_ParentMessageId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Messages_ParentMessageId" FOREIGN KEY ("ParentMessageId") REFERENCES public."Messages"("Id") ON DELETE RESTRICT;


--
-- Name: Messages FK_Messages_Users_AuthorId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: Notifications FK_Notifications_NotificationTypes_NotificationTypeId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_NotificationTypes_NotificationTypeId" FOREIGN KEY ("NotificationTypeId") REFERENCES public."NotificationTypes"("Id") ON DELETE CASCADE;


--
-- Name: Notifications FK_Notifications_Users_AuthorId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Notifications FK_Notifications_Users_NotifiedId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_Users_NotifiedId" FOREIGN KEY ("NotifiedId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: ProjectUserMTMTable FK_ProjectUserMTMTable_Projects_ProjectId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."ProjectUserMTMTable"
    ADD CONSTRAINT "FK_ProjectUserMTMTable_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"("Id") ON DELETE CASCADE;


--
-- Name: ProjectUserMTMTable FK_ProjectUserMTMTable_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."ProjectUserMTMTable"
    ADD CONSTRAINT "FK_ProjectUserMTMTable_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: Projects FK_Projects_Companies_CompanyId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "FK_Projects_Companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES public."Companies"("Id");


--
-- Name: Raports FK_Raports_Users_AuthorId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Raports"
    ADD CONSTRAINT "FK_Raports_Users_AuthorId" FOREIGN KEY ("AuthorId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: Reactions FK_Reactions_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Reactions"
    ADD CONSTRAINT "FK_Reactions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id");


--
-- Name: Sprints FK_Sprints_Projects_ProjectId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Sprints"
    ADD CONSTRAINT "FK_Sprints_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"("Id") ON DELETE CASCADE;


--
-- Name: Users FK_Users_UserPermissionsTypes_UserPermissionsTypeId; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "FK_Users_UserPermissionsTypes_UserPermissionsTypeId" FOREIGN KEY ("UserPermissionsTypeId") REFERENCES public."UserPermissionsTypes"("Id") ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict SEefHLgnjbqMoJUoDeYGh3DHZAo8LKGqb4P45u2XiLMEP4CgskT9s5ISg8ArV9p

