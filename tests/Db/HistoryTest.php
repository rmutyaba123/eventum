<?php

/*
 * This file is part of the Eventum (Issue Tracking System) package.
 *
 * @copyright (c) Eventum Team
 * @license GNU General Public License, version 2 or later (GPL-2+)
 *
 * For the full copyright and license information,
 * please see the COPYING and AUTHORS files
 * that were distributed with this source code.
 */

namespace Eventum\Test\Db;

use DateTime;
use Eventum\Model\Entity;
use Eventum\Model\Repository\IssueHistoryRepository;
use Eventum\Test\TestCase;
use Eventum\Test\Traits\DoctrineTrait;
use History;
use Setup;
use User;

/**
 * @group db
 */
class HistoryTest extends TestCase
{
    use DoctrineTrait;

    /** @var IssueHistoryRepository */
    private $repo;

    public function setUp(): void
    {
        $this->repo = $this->getEntityManager()->getRepository(Entity\IssueHistory::class);
    }

    public function testAddHistory(): void
    {
        $issue_id = 1;
        $usr_id = Setup::getSystemUserId();
        $htt_id = History::getTypeID('issue_closed');

        $his = new Entity\IssueHistory();
        $his->setIssueId($issue_id);
        $his->setUserId($usr_id);
        $his->setTypeId($htt_id);
        $his->setHidden(false);
        $his->setCreatedDate(new DateTime());
        $his->setSummary('entry added from unit test');
        $his->setContext(json_encode([]));
        $his->setMinRole(User::ROLE_ADMINISTRATOR);

        $this->persistAndFlush($his);
    }

    public function testHistoryType(): void
    {
        $htt_name = 'lol123';
        $htt = new Entity\HistoryType();
        $htt->setName($htt_name);
        $htt->setRoleId(0);
        $this->persistAndFlush($htt);

        // cleanup
        $em = $this->getEntityManager();
        $em->remove($htt);
        $em->flush();
    }
    public function testGetIssueCloser(): void
    {
        $usr_id = $this->repo->getIssueCloser(1);
        dump($usr_id);

        $usr_id = $this->repo->getIssueCloser(64);
        dump($usr_id);
    }
}
