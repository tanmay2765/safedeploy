--
-- PostgreSQL database cluster dump
--

\restrict 0oMPu7PWUWoDPHyTduX4PlP2XmIT4PzRf6OhdFGtTVD3vAhClysUOvhaPixeHDI

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE safedeploy_user;
ALTER ROLE safedeploy_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:UE3Xg7lJLfVAuyY3DcAzeQ==$TGcuiFa0viNy+C69vaLyqDc1SGW3jK1sSU+N+tNujNY=:qSg9STGP3VoM0cc6jkTCsUeyz3h0AYbJlbiYV9bPElI=';

--
-- User Configurations
--








\unrestrict 0oMPu7PWUWoDPHyTduX4PlP2XmIT4PzRf6OhdFGtTVD3vAhClysUOvhaPixeHDI

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict QUutHZvAQfA1s6ItqfV6Za93c1hzjR8bpgsEfhKnBkfEmZ9PMllGIQoIQ6orgHH

-- Dumped from database version 16.16
-- Dumped by pg_dump version 16.16

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

--
-- PostgreSQL database dump complete
--

\unrestrict QUutHZvAQfA1s6ItqfV6Za93c1hzjR8bpgsEfhKnBkfEmZ9PMllGIQoIQ6orgHH

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict 5U9xYncx990Qq5vVZGJIlRm04Zj09dAttfZefBtmYNnScceT8cdelYoDSsr3nEz

-- Dumped from database version 16.16
-- Dumped by pg_dump version 16.16

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

--
-- PostgreSQL database dump complete
--

\unrestrict 5U9xYncx990Qq5vVZGJIlRm04Zj09dAttfZefBtmYNnScceT8cdelYoDSsr3nEz

--
-- Database "safedeploy_db" dump
--

--
-- PostgreSQL database dump
--

\restrict JPe5b9xZOx1XhpNaaRnUBJgDOGwqpXXH40q6NuIilmaxJsbUQmSsrhDItsbQrSj

-- Dumped from database version 16.16
-- Dumped by pg_dump version 16.16

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

--
-- Name: safedeploy_db; Type: DATABASE; Schema: -; Owner: safedeploy_user
--

CREATE DATABASE safedeploy_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE safedeploy_db OWNER TO safedeploy_user;

\unrestrict JPe5b9xZOx1XhpNaaRnUBJgDOGwqpXXH40q6NuIilmaxJsbUQmSsrhDItsbQrSj
\connect safedeploy_db
\restrict JPe5b9xZOx1XhpNaaRnUBJgDOGwqpXXH40q6NuIilmaxJsbUQmSsrhDItsbQrSj

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO safedeploy_user;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.applications (
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    repository_url character varying(255) NOT NULL,
    git_branch character varying(100) DEFAULT 'main'::character varying NOT NULL,
    k8s_namespace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    threshold_config json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.applications OWNER TO safedeploy_user;

--
-- Name: deployments; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.deployments (
    id character varying(36) NOT NULL,
    application_id character varying(36) NOT NULL,
    target_version character varying(64) NOT NULL,
    previous_version character varying(64),
    docker_image character varying(255) NOT NULL,
    status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    current_canary_weight integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.deployments OWNER TO safedeploy_user;

--
-- Name: metric_records; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.metric_records (
    id character varying(36) NOT NULL,
    deployment_id character varying(36) NOT NULL,
    metric_name character varying(64) NOT NULL,
    value double precision NOT NULL,
    threshold double precision NOT NULL,
    is_violation boolean DEFAULT false NOT NULL,
    phase character varying(32) NOT NULL,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.metric_records OWNER TO safedeploy_user;

--
-- Name: pipeline_runs; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.pipeline_runs (
    id character varying(36) NOT NULL,
    application_id character varying(36) NOT NULL,
    deployment_id character varying(36),
    jenkins_build_number integer NOT NULL,
    jenkins_build_url character varying(255) NOT NULL,
    git_commit_hash character varying(40) NOT NULL,
    git_commit_message text,
    status character varying(32) DEFAULT 'QUEUED'::character varying NOT NULL,
    stage_durations json NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.pipeline_runs OWNER TO safedeploy_user;

--
-- Name: rollback_events; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.rollback_events (
    id character varying(36) NOT NULL,
    deployment_id character varying(36) NOT NULL,
    trigger_reason text NOT NULL,
    triggered_by character varying(32) NOT NULL,
    violation_details json,
    status character varying(32) DEFAULT 'COMPLETED'::character varying NOT NULL,
    executed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rollback_events OWNER TO safedeploy_user;

--
-- Name: security_findings; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.security_findings (
    id character varying(36) NOT NULL,
    security_scan_id character varying(36) NOT NULL,
    vulnerability_id character varying(128) NOT NULL,
    severity character varying(16) NOT NULL,
    package_name character varying(128),
    installed_version character varying(64),
    fixed_version character varying(64),
    description text,
    file_path character varying(255),
    line_number integer
);


ALTER TABLE public.security_findings OWNER TO safedeploy_user;

--
-- Name: security_scans; Type: TABLE; Schema: public; Owner: safedeploy_user
--

CREATE TABLE public.security_scans (
    id character varying(36) NOT NULL,
    deployment_id character varying(36) NOT NULL,
    scanner_type character varying(32) NOT NULL,
    scan_target character varying(255) NOT NULL,
    status character varying(32) DEFAULT 'PASSED'::character varying NOT NULL,
    critical_count integer DEFAULT 0 NOT NULL,
    high_count integer DEFAULT 0 NOT NULL,
    medium_count integer DEFAULT 0 NOT NULL,
    low_count integer DEFAULT 0 NOT NULL,
    raw_report_json json,
    executed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.security_scans OWNER TO safedeploy_user;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.alembic_version (version_num) FROM stdin;
3c7a12bbde92
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.applications (id, name, slug, repository_url, git_branch, k8s_namespace, threshold_config, is_active, created_at, updated_at) FROM stdin;
a0727ad7-e7e4-49a3-a261-554dacae8c69	Payment Processing Microservice	payment-service	https://github.com/safedeploy/payment-service.git	main	production	{"max_error_rate_percent": 1.0, "max_p99_latency_ms": 250, "security_gate_fail_on": ["CRITICAL", "HIGH"]}	t	2026-11-16 20:27:41.748197+00	2026-11-16 20:27:41.748197+00
556ac59e-61bb-4054-a067-0b9d55752888	Authentication & Identity Service	auth-service	https://github.com/safedeploy/auth-service.git	main	production	{"max_error_rate_percent": 0.5, "max_p99_latency_ms": 180, "security_gate_fail_on": ["CRITICAL"]}	t	2026-11-16 20:27:41.748197+00	2026-11-16 20:27:41.748197+00
b3a493e5-23e3-468a-83ab-2f0a9bb0e212	Inventory Microservice	inventory-service	https://github.com/safedeploy/inventory-service.git	main	production	{"max_error_rate_percent": 0.8, "max_p99_latency_ms": 200.0, "security_gate_fail_on": ["CRITICAL", "HIGH"]}	t	2026-11-16 20:28:22.181387+00	2026-11-16 20:28:22.181387+00
\.


--
-- Data for Name: deployments; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.deployments (id, application_id, target_version, previous_version, docker_image, status, current_canary_weight, started_at, completed_at) FROM stdin;
0230e3a0-2bbe-4881-bff7-c85f4a8bdf51	a0727ad7-e7e4-49a3-a261-554dacae8c69	v1.0.0	\N	123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.0.0	COMPLETED	100	2026-11-14 20:27:41.759283+00	2026-11-14 21:27:41.759283+00
295978ca-12c7-4693-a1d1-5c4b6c9acc41	a0727ad7-e7e4-49a3-a261-554dacae8c69	v1.1.0	v1.0.0	123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.1.0	ROLLED_BACK	0	2026-11-15 20:27:41.759283+00	2026-11-15 20:42:41.759283+00
25eceef8-5d98-431c-a478-0654542b84d0	a0727ad7-e7e4-49a3-a261-554dacae8c69	v1.2.0	v1.0.0	123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.2.0	CANARY_ACTIVE	20	2026-11-16 20:02:41.759283+00	\N
\.


--
-- Data for Name: metric_records; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.metric_records (id, deployment_id, metric_name, value, threshold, is_violation, phase, recorded_at) FROM stdin;
ca087d72-321a-431e-97c8-0d355698de1e	25eceef8-5d98-431c-a478-0654542b84d0	http_error_rate_percent	0.12	1	f	CANARY_20	2026-11-16 20:12:41.759283+00
719a8b57-07bf-425a-8694-ea9a03f28da8	25eceef8-5d98-431c-a478-0654542b84d0	http_error_rate_percent	0.15	1	f	CANARY_20	2026-11-16 20:15:41.759283+00
ef39ac20-274a-4a7d-b1d8-6e7a27c30fd5	25eceef8-5d98-431c-a478-0654542b84d0	http_error_rate_percent	0.18	1	f	CANARY_20	2026-11-16 20:18:41.759283+00
47d94d38-99a3-47e4-af78-ff2668f1cb59	25eceef8-5d98-431c-a478-0654542b84d0	http_error_rate_percent	0.14	1	f	CANARY_20	2026-11-16 20:21:41.759283+00
18a560c2-3849-43a2-ba1d-59ab42d35158	25eceef8-5d98-431c-a478-0654542b84d0	http_error_rate_percent	0.16	1	f	CANARY_20	2026-11-16 20:24:41.759283+00
a500fc14-edb8-41fc-9182-93207f6620c5	25eceef8-5d98-431c-a478-0654542b84d0	p99_latency_ms	145.2	250	f	CANARY_20	2026-11-16 20:12:41.759283+00
247e2eeb-66a4-45ea-a86f-3059cddca3a9	25eceef8-5d98-431c-a478-0654542b84d0	p99_latency_ms	138	250	f	CANARY_20	2026-11-16 20:15:41.759283+00
035c9b41-cf9c-42ba-bbcf-ea0cb8df83c1	25eceef8-5d98-431c-a478-0654542b84d0	p99_latency_ms	142.1	250	f	CANARY_20	2026-11-16 20:18:41.759283+00
c2a4fb75-c688-493d-a617-57c2d200e7ec	25eceef8-5d98-431c-a478-0654542b84d0	p99_latency_ms	140.5	250	f	CANARY_20	2026-11-16 20:21:41.759283+00
aee7fe55-e056-4f8b-8332-e88d43cbdefe	25eceef8-5d98-431c-a478-0654542b84d0	p99_latency_ms	139.2	250	f	CANARY_20	2026-11-16 20:24:41.759283+00
\.


--
-- Data for Name: pipeline_runs; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.pipeline_runs (id, application_id, deployment_id, jenkins_build_number, jenkins_build_url, git_commit_hash, git_commit_message, status, stage_durations, started_at, completed_at) FROM stdin;
b087cc4f-a9bc-4d09-9f18-a05e79c57c66	a0727ad7-e7e4-49a3-a261-554dacae8c69	25eceef8-5d98-431c-a478-0654542b84d0	42	http://localhost:8080/job/payment-service/42	9f8a12b3c4d5e6f708192a3b4c5d6e7f8091a2b3	feat(core): optimize db connection pool and retry logic	SUCCESS	{"Declarative: Checkout SCM": 3.2, "Unit & Integration Tests": 38.5, "Semgrep SAST Scan": 12.1, "Docker Build": 42.0, "Trivy Container Scan": 15.3, "Deploy Canary (5%)": 8.7}	2026-11-16 19:57:41.759283+00	2026-11-16 20:02:41.759283+00
\.


--
-- Data for Name: rollback_events; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.rollback_events (id, deployment_id, trigger_reason, triggered_by, violation_details, status, executed_at) FROM stdin;
6bf7d96d-4d6b-450a-82c2-31cc8cee3af6	295978ca-12c7-4693-a1d1-5c4b6c9acc41	Automated Rollback Triggered: http_error_rate_percent reached 3.82% which violates threshold 1.0% during CANARY_20	AUTOMATED_METRIC_VIOLATION	{"metric_name": "http_error_rate_percent", "value": 3.82, "threshold": 1.0, "phase": "CANARY_20"}	COMPLETED	2026-11-15 20:42:41.759283+00
\.


--
-- Data for Name: security_findings; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.security_findings (id, security_scan_id, vulnerability_id, severity, package_name, installed_version, fixed_version, description, file_path, line_number) FROM stdin;
3d285622-75f4-4964-993d-0cc827f2e312	03c403c8-0dd3-4efb-8306-f0a0d5c57a8d	python.lang.security.audit.non-literal-import	MEDIUM	\N	\N	\N	Dynamically loading module via user-controlled string parameter	src/handlers/router.py	84
69920644-34b3-4ec3-9788-8932dec8e42d	6299c508-f7a2-44e3-aa61-73fd57749cc7	CVE-2023-45853	MEDIUM	zlib	1.2.11	1.2.12	Integer overflow and resultant buffer overflow in MiniZip in zlib	\N	\N
\.


--
-- Data for Name: security_scans; Type: TABLE DATA; Schema: public; Owner: safedeploy_user
--

COPY public.security_scans (id, deployment_id, scanner_type, scan_target, status, critical_count, high_count, medium_count, low_count, raw_report_json, executed_at) FROM stdin;
03c403c8-0dd3-4efb-8306-f0a0d5c57a8d	25eceef8-5d98-431c-a478-0654542b84d0	SEMGREP	src/	PASSED	0	0	1	2	\N	2026-11-16 20:00:41.759283+00
6299c508-f7a2-44e3-aa61-73fd57749cc7	25eceef8-5d98-431c-a478-0654542b84d0	TRIVY	payment:v1.2.0	PASSED	0	0	2	5	\N	2026-11-16 20:01:41.759283+00
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: applications applications_name_key; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_name_key UNIQUE (name);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: deployments deployments_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT deployments_pkey PRIMARY KEY (id);


--
-- Name: metric_records metric_records_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.metric_records
    ADD CONSTRAINT metric_records_pkey PRIMARY KEY (id);


--
-- Name: pipeline_runs pipeline_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.pipeline_runs
    ADD CONSTRAINT pipeline_runs_pkey PRIMARY KEY (id);


--
-- Name: rollback_events rollback_events_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.rollback_events
    ADD CONSTRAINT rollback_events_pkey PRIMARY KEY (id);


--
-- Name: security_findings security_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.security_findings
    ADD CONSTRAINT security_findings_pkey PRIMARY KEY (id);


--
-- Name: security_scans security_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.security_scans
    ADD CONSTRAINT security_scans_pkey PRIMARY KEY (id);


--
-- Name: ix_applications_slug; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE UNIQUE INDEX ix_applications_slug ON public.applications USING btree (slug);


--
-- Name: ix_deployments_application_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_deployments_application_id ON public.deployments USING btree (application_id);


--
-- Name: ix_deployments_status; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_deployments_status ON public.deployments USING btree (status);


--
-- Name: ix_metric_records_deployment_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_metric_records_deployment_id ON public.metric_records USING btree (deployment_id);


--
-- Name: ix_metric_records_recorded_at; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_metric_records_recorded_at ON public.metric_records USING btree (recorded_at);


--
-- Name: ix_pipeline_runs_application_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_pipeline_runs_application_id ON public.pipeline_runs USING btree (application_id);


--
-- Name: ix_pipeline_runs_deployment_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_pipeline_runs_deployment_id ON public.pipeline_runs USING btree (deployment_id);


--
-- Name: ix_rollback_events_deployment_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_rollback_events_deployment_id ON public.rollback_events USING btree (deployment_id);


--
-- Name: ix_security_findings_security_scan_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_security_findings_security_scan_id ON public.security_findings USING btree (security_scan_id);


--
-- Name: ix_security_scans_deployment_id; Type: INDEX; Schema: public; Owner: safedeploy_user
--

CREATE INDEX ix_security_scans_deployment_id ON public.security_scans USING btree (deployment_id);


--
-- Name: deployments deployments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT deployments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: metric_records metric_records_deployment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.metric_records
    ADD CONSTRAINT metric_records_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id) ON DELETE CASCADE;


--
-- Name: pipeline_runs pipeline_runs_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.pipeline_runs
    ADD CONSTRAINT pipeline_runs_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: pipeline_runs pipeline_runs_deployment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.pipeline_runs
    ADD CONSTRAINT pipeline_runs_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id) ON DELETE SET NULL;


--
-- Name: rollback_events rollback_events_deployment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.rollback_events
    ADD CONSTRAINT rollback_events_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id) ON DELETE CASCADE;


--
-- Name: security_findings security_findings_security_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.security_findings
    ADD CONSTRAINT security_findings_security_scan_id_fkey FOREIGN KEY (security_scan_id) REFERENCES public.security_scans(id) ON DELETE CASCADE;


--
-- Name: security_scans security_scans_deployment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safedeploy_user
--

ALTER TABLE ONLY public.security_scans
    ADD CONSTRAINT security_scans_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JPe5b9xZOx1XhpNaaRnUBJgDOGwqpXXH40q6NuIilmaxJsbUQmSsrhDItsbQrSj

--
-- PostgreSQL database cluster dump complete
--

