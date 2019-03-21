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

namespace Eventum\Report;

use DomainException;

class Stats
{
    public function getStats(array $numbers): array
    {
        $sum = array_sum($numbers);

        return [
            'total' => $sum,
            'avg' => $sum / count($numbers),
            'median' => $this->median($numbers),
            'max' => max($numbers),
        ];
    }

    /**
     * @param int[] $numbers
     * @return float|int|mixed
     * @see https://codereview.stackexchange.com/a/223
     */
    private function median(array $numbers)
    {
        // perhaps all non numeric values should filtered out of $array here?
        $count = count($numbers);
        if ($count === 0) {
            throw new DomainException('Median of an empty array is undefined');
        }
        // if we're down here it must mean $array
        // has at least 1 item in the array.
        $middle_index = (int)floor($count / 2);
        sort($numbers, SORT_NUMERIC);
        $median = $numbers[$middle_index]; // assume an odd # of items
        // Handle the even case by averaging the middle 2 items
        if ($count % 2 === 0) {
            $median = ($median + $numbers[$middle_index - 1]) / 2;
        }

        return $median;
    }
}
